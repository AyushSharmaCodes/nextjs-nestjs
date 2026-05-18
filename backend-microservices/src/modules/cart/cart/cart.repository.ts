import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AppliedCoupon } from './entities/applied-coupon.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(AppliedCoupon) private appliedRepo: Repository<AppliedCoupon>,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;
    if (userId) {
      cart = await this.cartRepo.findOne({ where: { userId, status: 'ACTIVE' }, relations: ['items', 'appliedCoupon'] });
    } else if (sessionId) {
      cart = await this.cartRepo.findOne({ where: { sessionId, status: 'ACTIVE' }, relations: ['items', 'appliedCoupon'] });
    }
    if (!cart) {
      cart = this.cartRepo.create({ userId: userId || null, sessionId: sessionId || null, status: 'ACTIVE', expiresAt: userId ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  async addItem(cartId: string, item: Partial<CartItem>) {
    const existing = await this.itemRepo.findOne({ where: { cartId, productId: item.productId, variantId: item.variantId ?? undefined } });
    if (existing) {
      await this.itemRepo.update(existing.id, { quantity: existing.quantity + (item.quantity || 1) });
      return this.getCart(cartId);
    }
    const cartItem = this.itemRepo.create({ ...item, cartId, quantity: item.quantity || 1 });
    await this.itemRepo.save(cartItem);
    return this.getCart(cartId);
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    if (quantity <= 0) { await this.itemRepo.delete(itemId); } else { await this.itemRepo.update(itemId, { quantity }); }
    return this.getCart(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    await this.itemRepo.delete(itemId);
    return this.getCart(cartId);
  }

  async clearCart(cartId: string) {
    await this.itemRepo.delete({ cartId });
    await this.appliedRepo.delete({ cartId });
    return this.getCart(cartId);
  }

  async getCart(cartId: string) {
    return this.cartRepo.findOne({ where: { id: cartId }, relations: ['items', 'appliedCoupon'] });
  }

  async applyCoupon(cartId: string, couponId: string, couponCode: string, discountAmount: number) {
    await this.appliedRepo.delete({ cartId });
    const applied = this.appliedRepo.create({ cartId, couponId, couponCode, discountAmount });
    await this.appliedRepo.save(applied);
    return this.getCart(cartId);
  }

  async removeCoupon(cartId: string) {
    await this.appliedRepo.delete({ cartId });
    return this.getCart(cartId);
  }

  async mergeGuestCart(guestCartId: string, userId: string) {
    const guestCart = await this.getCart(guestCartId);
    if (!guestCart) return this.getOrCreateCart(userId);

    const userCart = await this.getOrCreateCart(userId);
    for (const item of guestCart.items || []) {
      await this.addItem(userCart.id, { productId: item.productId, variantId: item.variantId, quantity: item.quantity, title: item.title, imageUrl: item.imageUrl, pricePerUnit: item.pricePerUnit, mrp: item.mrp, variantLabel: item.variantLabel });
    }
    await this.cartRepo.update(guestCartId, { status: 'MERGED' });
    return this.getCart(userCart.id);
  }
}
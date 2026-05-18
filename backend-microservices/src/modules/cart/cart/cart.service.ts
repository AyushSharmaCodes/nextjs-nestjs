import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly repo: CartRepository) {}

  async getCart(userId?: string, sessionId?: string) { return this.repo.getOrCreateCart(userId, sessionId); }
  async addItem(userId: string | undefined, sessionId: string | undefined, item: AddCartItemDto) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.addItem(cart.id, item); }
  async updateQuantity(userId: string | undefined, sessionId: string | undefined, itemId: string, quantity: number) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.updateItemQuantity(cart.id, itemId, quantity); }
  async removeItem(userId: string | undefined, sessionId: string | undefined, itemId: string) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.removeItem(cart.id, itemId); }
  async clearCart(userId: string | undefined, sessionId: string | undefined) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.clearCart(cart.id); }
  async applyCoupon(userId: string | undefined, sessionId: string | undefined, couponId: string, code: string, discount: number) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.applyCoupon(cart.id, couponId, code, discount); }
  async removeCoupon(userId: string | undefined, sessionId: string | undefined) { const cart = await this.repo.getOrCreateCart(userId, sessionId); return this.repo.removeCoupon(cart.id); }
  async mergeCart(guestSessionId: string, userId: string) { return this.repo.mergeGuestCart(guestSessionId, userId); }
}
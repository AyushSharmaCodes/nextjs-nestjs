import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckoutService {
  async calculateSummary(cart: any) {
    const items = cart.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.pricePerUnit * item.quantity), 0);
    const discount = cart.appliedCoupon?.discountAmount || 0;
    const deliveryCharge = 0;
    const deliveryGst = 0;
    const total = subtotal + deliveryCharge + deliveryGst - discount;
    return { items, subtotal, discount, deliveryCharge, deliveryGst, total };
  }

  async initiateCheckout(cartId: string, userId: string, checkoutData: any) {
    return { cartId, userId, checkoutData, status: 'INITIATED' };
  }

  async completeCheckout(checkoutId: string, paymentId: string) {
    return { checkoutId, paymentId, status: 'COMPLETED' };
  }
}
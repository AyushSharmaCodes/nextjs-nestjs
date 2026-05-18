import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { InventoryModule } from './inventory/inventory.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ReviewModule } from './reviews/review.module';
import { VariantModule } from './variants/variant.module';

/**
 * Product/Catalog domain module.
 * Consolidates product, category, inventory, delivery, reviews, and variants.
 */
@Module({
  imports: [
    ProductModule,
    CategoryModule,
    InventoryModule,
    DeliveryModule,
    ReviewModule,
    VariantModule,
  ],
  exports: [ProductModule, CategoryModule, InventoryModule, DeliveryModule, ReviewModule, VariantModule],
})
export class ProductDomainModule {}

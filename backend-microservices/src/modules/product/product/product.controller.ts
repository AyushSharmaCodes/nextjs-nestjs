import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto, UpdateVariantDto } from './dto/product.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    const result = await this.productService.getProducts(query);
    return ApiResponse.success(result);
  }

  @Public()
  @Get('featured')
  async getFeaturedProducts() {
    const result = await this.productService.getFeaturedProducts();
    return ApiResponse.success(result);
  }

  @Public()
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.getProductById(id);
    return ApiResponse.success(product);
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Post()
  async createProduct(@Body() data: CreateProductDto) {
    const product = await this.productService.createProduct(data);
    return ApiResponse.success(product, 'Product created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: UpdateProductDto) {
    const product = await this.productService.updateProduct(id, data);
    return ApiResponse.success(product, 'Product updated');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(id);
    return ApiResponse.success(null, 'Product deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Post(':id/variants')
  async createVariant(@Param('id') productId: string, @Body() data: CreateVariantDto) {
    const variant = await this.productService.createVariant(productId, data);
    return ApiResponse.success(variant, 'Variant created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Put('variants/:variantId')
  async updateVariant(@Param('variantId') variantId: string, @Body() data: UpdateVariantDto) {
    const variant = await this.productService.updateVariant(variantId, data);
    return ApiResponse.success(variant, 'Variant updated');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Delete('variants/:variantId')
  async deleteVariant(@Param('variantId') variantId: string) {
    await this.productService.deleteVariant(variantId);
    return ApiResponse.success(null, 'Variant deleted');
  }

  @Public()
  @Get('variants/:variantId')
  async getVariant(@Param('variantId') variantId: string) {
    const variant = await this.productService.getVariantById(variantId);
    return ApiResponse.success(variant);
  }
}

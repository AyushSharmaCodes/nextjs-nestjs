import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate')
  async generate(@Body() body: { orderId: string }) {
    const invoice = await this.invoiceService.generateInvoice(body.orderId);
    return ApiResponse.success(invoice, 'Invoice generated');
  }

  @Get('order/:orderId')
  async getByOrder(@Param('orderId') orderId: string) {
    const invoice = await this.invoiceService.getInvoiceByOrderId(orderId);
    return ApiResponse.success(invoice);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const invoice = await this.invoiceService.getInvoiceById(id);
    return ApiResponse.success(invoice);
  }
}
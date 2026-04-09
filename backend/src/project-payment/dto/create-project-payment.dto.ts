import { IsNumber, IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentMode } from '../enums/payment-mode.enum';

export class CreateProjectPaymentDto {

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
import { IsNumber, IsOptional, IsString, IsPositive, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectPaymentDto {

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

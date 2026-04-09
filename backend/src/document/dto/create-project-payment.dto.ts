import { IsNumber, IsPositive, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectPaymentDto {

  @Type(() => Number)
@IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Amount must be a valid number' })
@IsPositive({ message: 'Amount must be greater than zero' })
amount: number;

  @IsString()
  paymentType: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}

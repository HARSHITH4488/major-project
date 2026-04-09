import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProjectDto {

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  projectType: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNumber()
  @Min(1)
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  status: string;
  @IsOptional()
@IsString()
description?: string;
}
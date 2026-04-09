import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectPaymentDto } from './create-project-payment.dto';

export class UpdateProjectPaymentDto extends PartialType(CreateProjectPaymentDto) {}
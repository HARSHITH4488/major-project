import {  IsOptional, IsString } from 'class-validator';
import { DocumentCategory } from '../document-category.enum';

export class UploadDocumentDto {

 @IsString()
category: string;
  @IsOptional()
  @IsString()
  uploadedByName?: string;

  @IsOptional()
  @IsString()
  uploadedByRole?: string;
}

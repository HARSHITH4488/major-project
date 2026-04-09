import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from './document.entity';
import { Project } from '../project/project.entity';
import { DocumentContractor } from './document-contractor.entity'; // ✅ ADD THIS

import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Project,
      DocumentContractor, // ✅ VERY IMPORTANT
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
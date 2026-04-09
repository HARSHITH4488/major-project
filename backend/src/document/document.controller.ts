import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Res,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // ================= GET ALL (PAGINATION) =================
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.documentService.findAll(query);
  }

  // ================= UPLOAD =================
  @Post(':projectId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const projectId = req.params.projectId;
          const uploadPath = `./uploads/project-${projectId}`;
          const fs = require('fs');

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },

      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only PDF, JPG, PNG, XLSX allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadDocument(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ) {
    return this.documentService.upload(
      projectId,
      file,
      body.category,
      body.uploadedByName,
      body.uploadedByRole,
    );
  }

  // ================= GET PROJECT DOCUMENTS =================
  @Get('project/:projectId')
  getDocumentsByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.documentService.getDocumentsByProject(projectId);
  }

  // ================= DOWNLOAD =================
  @Get('download/:id')
  async downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { filePath, fileName } =
      await this.documentService.downloadDocument(id);

    return res.download(filePath, fileName);
  }

  // ================= DELETE =================
  @Delete(':id')
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.deleteDocument(id);
  }

  // ================= SHARE DOCUMENT (ADMIN → CONTRACTOR) =================
 @Patch('share/:id')
shareDocument(
  @Param('id', ParseIntPipe) id: number,
  @Body('contractorIds') contractorIds: number[],
) {
  return this.documentService.shareDocument(id, contractorIds);
}

  // ================= CONTRACTOR DOCUMENT VIEW =================
  @Get('contractor/:contractorId/project/:projectId')
  getDocumentsForContractor(
    @Param('contractorId', ParseIntPipe) contractorId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.documentService.getDocumentsForContractor(
      contractorId,
      projectId,
    );
  }
  @Get('project/:projectId/contractor')
getContractorDocuments(
  @Param('projectId', ParseIntPipe) projectId: number,
) {
  return this.documentService.getContractorDocumentsByProject(projectId);
}
}
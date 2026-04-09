import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Delete,                // ✅ ADD
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ProjectUpdateService } from './project-update.service';

@Controller('project-updates')
export class ProjectUpdateController {

  constructor(
    private readonly updateService: ProjectUpdateService,
  ) {}

  /* ===============================
     CREATE UPDATE (WITH IMAGE)
  =================================*/

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/project-updates',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  createUpdate(
    @Body('projectId') projectId: number,
    @Body('contractorId') contractorId: number,
    @Body('note') note: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.updateService.createUpdate(
      projectId,
      contractorId,
      note,
      file,
    );
  }

  /* ===============================
     GET PROJECT UPDATES
  =================================*/

  @Get('project/:projectId')
  getUpdatesByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.updateService.getUpdatesByProject(projectId);
  }

  /* ===============================
     DELETE UPDATE (ADMIN)
  =================================*/

  @Delete(':id')
  deleteUpdate(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.updateService.deleteUpdate(id);
  }
}
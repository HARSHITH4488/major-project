import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { Project } from '../project/project.entity';
import { DocumentContractor } from './document-contractor.entity';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(DocumentContractor)
    private readonly documentContractorRepo: Repository<DocumentContractor>,
  ) {}

  // ================= UPLOAD =================
  async upload(
    projectId: number,
    file: Express.Multer.File,
    category: string,
    uploadedByName: string,
    uploadedByRole: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const document = this.documentRepository.create({
      fileName: file.originalname,
      fileType: file.mimetype,
      filePath: file.path,
      fileSize: file.size,
      category,
      uploadedByName,
      uploadedByRole,
      project,
    });

    return await this.documentRepository.save(document);
  }

  // ================= GET PROJECT DOCUMENTS =================
  async getDocumentsByProject(projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return await this.documentRepository.find({
      where: { project: { id: projectId } },
      order: { uploadedAt: 'DESC' },
    });
  }

  // ================= DOWNLOAD =================
  async downloadDocument(documentId: number) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.resolve(document.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return {
      filePath,
      fileName: document.fileName,
    };
  }

  // ================= DELETE =================
  async deleteDocument(documentId: number) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.resolve(document.filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.documentRepository.remove(document);

    return {
      message: 'Document deleted successfully',
    };
  }

  // ================= PAGINATION =================
  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'id', order = 'DESC' } = query;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.project', 'project');

    if (search) {
      qb.where('document.fileName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedSortFields = ['id', 'fileName', 'uploadedAt'];

    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException('Invalid sort field');
    }

    qb.orderBy(`document.${sortBy}`, order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ================= SHARE DOCUMENT (MULTIPLE CONTRACTORS) =================
  async shareDocument(documentId: number, contractorIds: number[]) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!contractorIds || contractorIds.length === 0) {
      throw new BadRequestException('At least one contractor must be selected');
    }

    // Mark visible
    document.visibleToContractor = true;
    await this.documentRepository.save(document);

    // Prevent duplicate sharing
    const existing = await this.documentContractorRepo.find({
      where: { document: { id: documentId } },
      relations: ['contractor'],
    });

    const existingIds = existing.map(e => e.contractor.id);

    const newIds = contractorIds.filter(id => !existingIds.includes(id));

    const entries = newIds.map((contractorId) =>
      this.documentContractorRepo.create({
        document,
        contractor: { id: contractorId },
      }),
    );

    await this.documentContractorRepo.save(entries);

    return {
      message: 'Document shared successfully',
    };
  }

  // ================= CONTRACTOR VIEW =================
  async getDocumentsForContractor(contractorId: number, projectId: number) {
    return await this.documentRepository
      .createQueryBuilder('document')
      .leftJoin('document.sharedWith', 'dc')
      .where('document.projectId = :projectId', { projectId })
      .andWhere(
        '(dc.contractorId = :contractorId OR document.uploadedByRole = :role)',
        { contractorId, role: 'CONTRACTOR' },
      )
      .orderBy('document.uploadedAt', 'DESC')
      .getMany();
  }

  // ================= CONTRACTOR UPLOADED FILES =================
  async getContractorDocumentsByProject(projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return await this.documentRepository.find({
      where: {
        project: { id: projectId },
        uploadedByRole: 'CONTRACTOR',
      },
      order: { uploadedAt: 'DESC' },
    });
  }
}
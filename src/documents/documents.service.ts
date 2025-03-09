import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { User, UserRole } from '../users/entities/user.entity';
import * as fs from 'fs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  private baseUrl = this.configService.get('INGESTION_URL')
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private configService: ConfigService

  ) { }

  async create(
    { createDocumentDto, file, user, cookie }: {
      createDocumentDto: CreateDocumentDto,
      file: Express.Multer.File,
      user: User,
      cookie: any
    }
  ): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      status: DocumentStatus.PENDING,
      user,
    });

    const savedDocument = await this.documentsRepository.save(document);
    // Start the ingestion process asynchronously
    this.processDocument(savedDocument.id).catch(error => {
      console.error(`Error processing document ${savedDocument.id}:`, error);
    });

    return savedDocument;
  }

  async findAll(user: User): Promise<Document[]> {
    if (user.role === UserRole.ADMIN) {
      return this.documentsRepository.find({
        relations: ['user'],
      });
    } else {
      return this.documentsRepository.find({
        where: { user: { id: user.id } },
        relations: ['user'],
      });
    }
  }

  async findOne(id: string, user: User): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check if user has access to this document
    if (user.role !== UserRole.ADMIN && document.user.id !== user.id) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    return document;
  }

  async update({ id, updateDocumentDto, user, cookie, file }: { id: string, updateDocumentDto: UpdateDocumentDto, user: User, cookie: any, file?: Express.Multer.File }): Promise<Document> {
    const document = await this.findOne(id, user);
    if (updateDocumentDto.title) {
      document.title = updateDocumentDto.title;
    }

    if (updateDocumentDto.description !== undefined) {
      document.description = updateDocumentDto.description;
    }

    if (file) {
      if (document.filePath) {
        try {
          await fs.promises.unlink(document.filePath);
        } catch (error) {
          console.warn(`Failed to delete old file: ${document.filePath}`, error);
        }
      }
      document.fileName = file.originalname;
      document.filePath = file.path;
      document.fileType = file.mimetype;
      document.fileSize = file.size;
      //once user update then again need to process and need to get mock_ingestion response ya??//
      this.processDocument(id).catch(error => {
        console.error(`Error processing document ${id}:`, error);
      });

    }
    return await this.documentsRepository.save(document);
  }
  


  async remove(id: string, user: User): Promise<void> {
    const document = await this.findOne(id, user);
    try {
      fs.unlinkSync(document.filePath);
    } catch (error) {
      console.error(`Error deleting file ${document.filePath}:`, error);
    }

    await this.documentsRepository.remove(document);
  }

  async updateStatus({ documentId, documentStatus }: { documentId: string, documentStatus: string }) {
    let documentData;
    try {
      documentData = await this.documentsRepository.findOne({
        where: { id: documentId },
      });
      if (!documentData) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      }
      console.log('documentStatus:', documentStatus);
      documentData.status = documentStatus;
      documentData.errorMessage = null;
      await this.documentsRepository.save(documentData);
    } catch (error) {
      console.log('error:', error);
      documentData.status = documentStatus;
      documentData.errorMessage = error.message;
      await this.documentsRepository.save(documentData);
      throw error;
    }
  }

  async processDocument(documentId: string): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    try {
      // Update status to processing      
      // Process the document using Mock     
      //microservice connection//
      const internal_secrete = this.configService.get<string>('X-INTERNAL-VAL');
      const response = await axios.post(
        `${this.baseUrl}`,
        { documentId }, 
        {
          headers: {
            'x-internal-request': internal_secrete || "your_jwt_secret_key_change_in_production",
          },

        }
      );

      // console.log('response:', response);
      document.status = response.data.status;
      await this.documentsRepository.save(document);
    } catch (error) {
      // Update status to failed
      document.status = DocumentStatus.FAILED;
      document.errorMessage = error.message;
      await this.documentsRepository.save(document);
      throw error;
    }
  }

  async getDocumentStatus(id: string, user: User): Promise<{ status: DocumentStatus; errorMessage?: string }> {
    const document = await this.findOne(id, user);
    return {
      status: document.status,
      errorMessage: document.errorMessage,
    };
  }

}
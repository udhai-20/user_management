import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  async startIngestion(@Body('documentId') documentId: string) {
    return await this.ingestionService.processDocument(documentId);
  }

  @Get(':id/reprocess')
  async getStatus(@Param('id') documentId: string) {
    return await this.ingestionService.processDocument(documentId);
  }
  @Get(':id/embeddings')
  async getEmbeddings(@Param('id') documentId: string) {
    return this.ingestionService.getMockEmbeddings(documentId);
  }


}

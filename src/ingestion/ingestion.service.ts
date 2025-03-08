import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IngestionService {
  private documentStatus = new Map<string, string>(); // Stores status in-memory

  async processDocument(documentId: string) {
    this.documentStatus.set(documentId, 'Processing');
   setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      this.documentStatus.set(documentId, isSuccess ? 'Completed' : 'Failed');
      axios.post(documentId,)
    }, 5000); // 5-second delay

    return { documentId, status: 'Processing' };
  }
  async getDocumentStatus(documentId: string) {
    return { documentId, status: this.documentStatus.get(documentId) || 'Not Found' };
  }
  async getMockEmbeddings(documentId: string) {
    return {
      documentId,
      embeddings: Array(10).fill(0).map(() => Math.random().toFixed(4)), 
    };
  }
  
  

}

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path';
import * as fs from 'fs';
import { fileUploadOptions } from 'src/utils';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Documents') // Grouping API in Swagger UI
@ApiBearerAuth() // Adds JWT Authorization in Swagger
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR)
  @UseInterceptors(FileInterceptor("file", fileUploadOptions))
  @ApiOperation({ summary: 'Upload a new document (Editor only)' })
  @ApiConsumes('multipart/form-data') // Specifies file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const cookie=req.headers.cookie;
    console.log('cookie:', cookie);
    const response= await this.documentsService.create({createDocumentDto, file, user:req.user,cookie});
    return{
      message:"Document update successfully",
      data:response
    }
  }



  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.VIEWER, UserRole.EDITOR)
  @ApiOperation({ summary: 'Get all documents (Viewer, Editor)' })
  @ApiResponse({ status: 200, description: 'Returns list of documents' })
  async findAll(@Request() req) {
    const response= await this.documentsService.findAll(req.user);
    return{
      message:"All the Document retrieved successfully",
      data:response
    }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VIEWER, UserRole.EDITOR)
  @ApiOperation({ summary: 'Get document by ID (Viewer, Editor)' })
  @ApiParam({ name: 'id', required: true, description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Returns document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const response= await this.documentsService.findOne(id, req.user);
    return{
      message:"Document retrieved successfully",
      data:response
    }
  }

  @Patch('/updateStatus/:id')
   @ApiParam({ name: 'id', required: true, description: 'Document ID' })
  // @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentStatus: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR,UserRole.VIEWER)
   async updateStatus(
    @Param('id') id: string,
    @Body("documentStatus") documentStatus: string,
    // @Request() req?,
  ) {
    // const cookie=req.header.cookie;
    // console.log('req:', req.headers)
    const response= await this.documentsService.updateStatus({documentId:id,documentStatus});
    return{
      message:"Document updated successfully",
      data:response
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor("file", fileUploadOptions))
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Update a document (Editor only)' })
  @ApiParam({ name: 'id', required: true, description: 'Document ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req?,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const cookie=req.header.cookie;
    const response= await this.documentsService.update({id, updateDocumentDto, user:req.user, file,cookie});
    return{
      message:"Document updated successfully",
      data:response
    }
  }


  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Delete a document (Editor only)' })
  @ApiParam({ name: 'id', required: true, description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(@Param('id') id: string, @Request() req) {
    const response= await this.documentsService.remove(id, req.user);
    return{
      message:"Document Deleted successfully",
      data:response
    }
  }
}

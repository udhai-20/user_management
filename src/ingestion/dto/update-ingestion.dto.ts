import { PartialType } from '@nestjs/swagger';
import { CreateIngestionDto } from './create-ingestion.dto';

export class UpdateIngestionDto extends PartialType(CreateIngestionDto) {}

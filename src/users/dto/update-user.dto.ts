import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'User email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'User password' })
  password?: string;
}

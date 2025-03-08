import { 
  Controller, Get, Body, Patch, Param, Delete, UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { QueryFailedError } from 'typeorm';
export interface CustomRequest extends Request {
  user: { id: string; name: string; role: string }; // Add only necessary fields
}
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    // console.log("check");
    const response= await this.usersService.findAll();
    return {
      message:"User Retrieved Successfully",
      data:response
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (user can see only their own details)' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 403, description: 'Forbidden: You can only view your own details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    // Allow access if `x-internal` is present OR if the user is accessing their own data
    if (req.headers['x-internal'] || req.user?.id === id) {
      const response= await this.usersService.findOne(id);
      return {
        message:"User Retrieved Successfully",
        data:response
      }
    }
  
    throw new ForbiddenException('You can only view your own details.');
  }
  

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Update user details (Editor only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const response= await this.usersService.update(id, updateUserDto);
    return {
      message:"User Updated Successfully",
      data:response
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    const response= await this.usersService.remove(id);
        return {
        message:"User Deleted Successfully",
        data:response
      }
    
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(UserRole), 
          example: 'admin',
        },
      },
    },
  })
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    try {
      const response= await this.usersService.updateRole(id, role);
    
      return {
        message:"UserRole updated Successfully",
        data:response
      }
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('invalid input value for enum')) {
        throw new BadRequestException(`Invalid role provided: ${role}`);
      }
      throw new InternalServerErrorException('Something went wrong while updating the role');
    }
  }
}

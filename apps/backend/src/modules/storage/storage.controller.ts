import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Storage & Media')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image or video file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folderBody?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file payload was uploaded.');
    }
    
    // Clean and validate the folder parameter to prevent path traversal vulnerability
    let cleanFolder = '';
    const folder = folderBody || '';
    if (folder) {
      cleanFolder = folder.replace(/[^\w-]/g, ''); // alphanumeric, dashes, and underscores only
    }

    const fileUrl = await this.storageService.saveFile(file, cleanFolder);
    return {
      success: true,
      message: 'File uploaded successfully.',
      url: fileUrl,
    };
  }
}

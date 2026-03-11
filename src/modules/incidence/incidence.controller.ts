import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { IncidenceService } from './incidence.service';
import {
  CreateIncidenceDto,
  FilterIncidenceDto,
  UpdateIncidenceDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { fileFilter } from '../../common/filters';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incidencias')
export class IncidenceController {
  constructor(private readonly incidenceService: IncidenceService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('fotos', 5, {
      storage: memoryStorage(),
      fileFilter: fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateIncidenceDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.incidenceService.create(dto, files);
  }

  @Get()
  getAllPending(@Query() dto: FilterIncidenceDto) {
    return this.incidenceService.getAllPending(dto);
  }

  @Get('sereno/:id')
  getAllByShield(
    @Param('id', ParseIntPipe) id: number,
    @Query() dto: FilterIncidenceDto,
  ) {
    return this.incidenceService.getAllByShield(id, dto);
  }

  @Get('historial')
  getHistorial(@Query() dto: FilterIncidenceDto) {
    return this.incidenceService.getHistorial(dto);
  }

  @Get('fotos/*path')
  getFile(@Param('path') path: string[] | string, @Res() res: Response) {
    const filePath = this.incidenceService.getFile(path);
    return res.sendFile(filePath);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidenceService.getOne(id);
  }

  @Patch(':id')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidenceDto,
    @Req() req: Request,
  ) {
    return this.incidenceService.approve(id, dto, req.user);
  }

  /* @Delete(':id')
  disapprove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.incidenceService.disapprove(id, req.user);
  } */
}

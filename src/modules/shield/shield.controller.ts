import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShieldService } from './shield.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('serenos')
export class ShieldController {
  constructor(private readonly shieldService: ShieldService) {}

  @Get()
  getAll() {
    return this.shieldService.getAll();
  }

  @Get('cargos')
  getJobs() {
    return this.shieldService.getJobs();
  }

  @Get('jurisdicciones')
  getJurisdictions() {
    return this.shieldService.getJurisdictions();
  }

  @Get(':dni')
  getByDni(@Param('dni') dni: string) {
    return this.shieldService.getByDni(dni);
  }

  @Patch('phone')
  updatePhone(@Body() dto: { celular: string }, @Req() req: Request) {
    return this.shieldService.updatePhone(dto, req.user);
  }
}

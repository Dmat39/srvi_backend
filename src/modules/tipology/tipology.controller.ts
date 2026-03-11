import { Controller, Get, UseGuards } from '@nestjs/common';
import { TipologyService } from './tipology.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipificaciones')
export class TipologyController {
  constructor(private readonly tipologyService: TipologyService) {}

  @Get('tipo_casos')
  getAll() {
    return this.tipologyService.getAll();
  }

  @Get('tipo_reportante')
  getReports() {
    return this.tipologyService.getReports();
  }

  @Get('subtipo_casos')
  getSubTypes() {
    return this.tipologyService.getSubTypes();
  }

  @Get('unidades')
  getUnits() {
    return this.tipologyService.getUnits();
  }
}

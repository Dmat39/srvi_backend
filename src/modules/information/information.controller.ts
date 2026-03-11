import { Controller, Get, UseGuards } from '@nestjs/common';
import { InformationService } from './information.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('informacion')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get('genero_agresor')
  getGenderAggressor() {
    return this.informationService.getGender();
  }

  @Get('genero_victima')
  getGenderVictim() {
    return this.informationService.getGender();
  }

  @Get('severidad_procesos')
  getProcessSeverities() {
    return this.informationService.getProcessSeverities();
  }

  @Get('estados_proceso')
  getProcessStates() {
    return this.informationService.getProcessStates();
  }

  @Get('severidades')
  getSeverities() {
    return this.informationService.getSeverities();
  }
}

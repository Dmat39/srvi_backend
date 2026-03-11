import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProcessService } from './process.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('procesos')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get('medios')
  getMeans() {
    return this.processService.getMeans();
  }

  @Get('operadores')
  getOperators() {
    return this.processService.getOperators();
  }

  @Get('situaciones')
  getSituations() {
    return this.processService.getSituations();
  }
}

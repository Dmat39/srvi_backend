import { Module } from '@nestjs/common';
import { IncidenceService } from './incidence.service';
import { IncidenceController } from './incidence.controller';
import { IncidenceGateway } from './incidence.gateway';
import { TipologyModule } from '../tipology/tipology.module';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [TipologyModule, ProcessModule],
  controllers: [IncidenceController],
  providers: [IncidenceGateway, IncidenceService],
})
export class IncidenceModule {}

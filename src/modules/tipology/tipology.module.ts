import { Module } from '@nestjs/common';
import { TipologyService } from './tipology.service';
import { TipologyController } from './tipology.controller';

@Module({
  controllers: [TipologyController],
  providers: [TipologyService],
  exports: [TipologyService],
})
export class TipologyModule {}

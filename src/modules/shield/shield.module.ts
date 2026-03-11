import { Module } from '@nestjs/common';
import { ShieldService } from './shield.service';
import { ShieldController } from './shield.controller';

@Module({
  controllers: [ShieldController],
  providers: [ShieldService],
  exports: [ShieldService],
})
export class ShieldModule {}

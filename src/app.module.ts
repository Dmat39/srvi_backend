import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SqlModule } from './modules/sql/sql.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShieldModule } from './modules/shield/shield.module';
import { TipologyModule } from './modules/tipology/tipology.module';
import { ProcessModule } from './modules/process/process.module';
import { InformationModule } from './modules/information/information.module';
import { ExternalModule } from './modules/external/external.module';
import { IncidenceModule } from './modules/incidence/incidence.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    SqlModule,
    AuthModule,
    ShieldModule,
    TipologyModule,
    ProcessModule,
    InformationModule,
    ExternalModule,
    IncidenceModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

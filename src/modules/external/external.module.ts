import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ExternalService } from './external.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'HTTP_GESTIONATE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const instance = axios.create({
          baseURL: config.get<string>('BACK_GESTIONATE_URL'),
          timeout: config.get<number>('HTTP_TIMEOUT'),
          maxRedirects: config.get<number>('HTTP_MAX_REDIRECTS'),
        });
        return new HttpService(instance);
      },
    },
    {
      provide: 'HTTP_SCI',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const instance = axios.create({
          baseURL: config.get<string>('BACK_SCI_URL'),
          timeout: config.get<number>('HTTP_TIMEOUT'),
          maxRedirects: config.get<number>('HTTP_MAX_REDIRECTS'),
        });
        return new HttpService(instance);
      },
    },
    ExternalService,
  ],
  exports: ['HTTP_GESTIONATE', 'HTTP_SCI', ExternalService],
})
export class ExternalModule {}

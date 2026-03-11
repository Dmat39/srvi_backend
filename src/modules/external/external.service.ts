import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoginDto } from '../auth/dto';

@Injectable()
export class ExternalService {
  constructor(
    private readonly config: ConfigService,
    @Inject('HTTP_GESTIONATE') private readonly httpSCG: HttpService,
    @Inject('HTTP_SCI') private readonly httpSCI: HttpService,
  ) {}

  async getExternalLogin(dto: LoginDto): Promise<any> {
    try {
      const key = this.config.get<string>('API_KEY');
      if (!key)
        throw new InternalServerErrorException('Variable interna no definida');
      const response = await firstValueFrom(
        this.httpSCG.post('external/login', dto, {
          headers: {
            'x-api-key': key,
          },
        }),
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyExternalDni(dni: string) {
    try {
      const key = this.config.get<string>('API_KEY_VERIFY');
      if (!key)
        throw new InternalServerErrorException('Variable interna no definida');
      const response = await firstValueFrom(
        this.httpSCG.get(`empleados/verify/${dni}`, {
          headers: {
            'x-api-key': key,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateExternalPhone(id: number, phone: string) {
    try {
      const key = this.config.get<string>('API_KEY_VERIFY');
      if (!key)
        throw new InternalServerErrorException('Variable interna no definida');
      const response = await firstValueFrom(
        this.httpSCG.patch(
          `empleados/phone/${id}`,
          { celular: phone },
          {
            headers: {
              'x-api-key': key,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExternalToken(): Promise<string> {
    try {
      const username = this.config.get<string>('SCI_USERNAME');
      const password = this.config.get<string>('SCI_PASSWORD');
      if (!username || !password)
        throw new InternalServerErrorException(
          'Variables internas no definidas',
        );
      const response = await firstValueFrom(
        this.httpSCI.post('auth/login', { username, password }),
      );
      return response.data.data.token;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createExternalIncidence(dto: any, token: string): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpSCI.post('incidence/add', dto, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data.data.id;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createExternalRegister(data: any, token: string) {
    try {
      const response = await lastValueFrom(
        this.httpSCI.post('record/add', data, {
          headers: {
            ...data.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    const fallback = 'El sistema no se encuentra disponible';
    if (!(error instanceof AxiosError))
      throw new InternalServerErrorException(fallback);
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.message || error.response?.data?.error || fallback;
    throw new (
      {
        400: BadRequestException,
        401: UnauthorizedException,
        403: ForbiddenException,
      }[status] ?? InternalServerErrorException
    )(message);
  }
}

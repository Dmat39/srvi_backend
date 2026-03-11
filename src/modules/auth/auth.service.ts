import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import * as argon from 'argon2';
import { LoginDto } from './dto';
import { JwtPayload } from './interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import { ExternalService } from '../external/external.service';
import { ShieldService } from '../shield/shield.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly external: ExternalService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly shieldService: ShieldService,
  ) {}

  async loginExternal(dto: LoginDto) {
    const personal = await this.external.getExternalLogin(dto);
    const { data } = await this.shieldService.getByDni(personal.dni);
    const user = await this.prisma.user.findFirst({
      select: { rol: true },
      where: { shieldId: data.id },
    });
    const token = await this.getJwtToken({
      sub: personal.id,
      did: personal.dni,
      rlu: user?.rol || Rol.SHIELD,
    });
    return {
      message: 'Login exitoso',
      data: {
        nombres: personal.nombres,
        apellidos: personal.apellidos,
        celular: personal.celular,
        id_sereno: data.id,
        cargo_sereno_id: data.cargo_sereno_id,
        cargo_sereno: data.cargo_sereno_descripcion,
        rol: user?.rol || Rol.SHIELD,
      },
      token,
    };
  }

  async loginUser(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException('Credenciales incorrectas');
    const verify = await argon.verify(user.password, password);
    if (!verify) throw new UnauthorizedException('Credenciales incorrectas');
    const token = await this.getJwtToken({
      sub: user.incidenceId,
      rlu: user.rol,
    });
    return {
      message: 'Login exitoso',
      data: {
        rol: user.rol,
        shift: user.shift,
        user_id: user.incidenceId,
      },
      token,
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }
}

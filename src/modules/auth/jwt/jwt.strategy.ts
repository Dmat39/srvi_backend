import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { ExternalService } from '../../../modules/external/external.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private readonly external: ExternalService,
  ) {
    super({
      secretOrKey: config.get<string>('JWT_SECRET') as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, did, rlu } = payload;
    if (did) {
      const { success } = await this.external.verifyExternalDni(did);
      if (!success)
        throw new UnauthorizedException('Sesión finalizada, vuelva a ingresar');
    }
    return {
      id: sub,
      rol: rlu,
    };
  }
}

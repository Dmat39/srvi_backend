import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: number | null;
  did?: string;
  rlu: Rol;
}

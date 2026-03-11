import { BadRequestException, Injectable } from '@nestjs/common';
import { Rol, User } from '@prisma/client';
import * as argon from 'argon2';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationHelper, timezoneHelper } from '../../common/helpers';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sql: SqlService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { password: pw, email, rol, ...res } = dto;
    const userSystem = await this.sql.query(
      `
        SELECT id
        FROM users
        WHERE email = @email
      `,
      { email },
    );
    let incidenceId: number | null = null;
    if (rol === Rol.VALIDATOR) {
      if (userSystem.length === 0)
        throw new BadRequestException(
          'No está registrado en el sistema antiguo',
        );
      incidenceId = Number(userSystem[0].id);
    }
    const password = pw
      ? await argon.hash(pw, {
          type: argon.argon2id,
          timeCost: 3,
          memoryCost: 2 ** 16, // ~64 MB
          parallelism: 1,
        })
      : null;
    const user = await this.prisma.user.create({
      data: {
        ...res,
        rol,
        email,
        password,
        incidenceId,
        createdAt: timezoneHelper(),
        updatedAt: timezoneHelper(),
      },
    });
    return await this.getUserById(user.id);
  }

  async findAll(dto: FilterUserDto): Promise<any> {
    const { search, rol, ...pagination } = dto;
    const where: any = {};
    if (rol) where.rol = rol;
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
      ];
    const users = await paginationHelper(
      this.prisma.user,
      {
        where,
        orderBy: { lastname: 'asc' },
      },
      pagination,
    );
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.getUserById(id);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const { password, ...res } = dto;
    await this.getUserById(id);
    const data = password
      ? {
          password: await argon.hash(password, {
            type: argon.argon2id,
            timeCost: 3,
            memoryCost: 2 ** 16, // ~64 MB
            parallelism: 1,
          }),
          updatedAt: timezoneHelper(),
          ...res,
        }
      : { updatedAt: timezoneHelper(), ...res };
    await this.prisma.user.update({
      data,
      where: { id },
    });
    return await this.getUserById(id);
  }

  async toggleDelete(id: string): Promise<any> {
    const user = await this.getUserById(id);
    const inactive = user.deletedAt;
    const deletedAt = inactive ? null : timezoneHelper();
    await this.prisma.user.update({
      data: {
        updatedAt: timezoneHelper(),
        deletedAt,
      },
      where: { id },
    });
    return {
      action: inactive ? 'RESTORE' : 'DELETE',
      id,
    };
  }
  async getUserById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        lastname: true,
        email: true,
        rol: true,
        shift: true,
        incidenceId: true,
        shieldId: true,
        observation: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    return user;
  }
}

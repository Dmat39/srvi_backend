import { BadRequestException, Injectable } from '@nestjs/common';
import { SqlService } from '../sql/sql.service';
import { ExternalService } from '../external/external.service';

@Injectable()
export class ShieldService {
  constructor(
    private readonly sql: SqlService,
    private readonly external: ExternalService,
  ) {}

  async getAll() {
    const shields = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          "apellidoPaterno",
          "apellidoMaterno",
          nombres,
          CAST("cargoSerenoId" AS INT) AS cargo_sereno_id
        FROM serenos
        WHERE habilitado = true
        ORDER BY "apellidoPaterno" ASC
      `,
    );
    return {
      message: 'Serenos obtenidos correctamente',
      data: shields,
    };
  }

  async getByDni(dni: string) {
    const shield = await this.sql.query(
      `
        SELECT
          CAST(s.id AS INT) AS id,
          s."apellidoPaterno",
          s."apellidoMaterno",
          s.nombres,
          CAST(s."cargoSerenoId" AS INT) AS cargo_sereno_id,
          cs.descripcion AS cargo_sereno_descripcion
        FROM serenos s
        INNER JOIN cargo_serenos cs
          ON cs.id = s."cargoSerenoId"
        WHERE s.habilitado = true AND s.dni = @dni
      `,
      { dni },
    );
    if (shield.length === 0)
      throw new BadRequestException('Credenciales incorrectas');
    return {
      message: 'Sereno obtenido correctamente',
      data: shield[0],
    };
  }

  async getJobs() {
    const jobs = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM cargo_serenos
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Cargos obtenidos correctamente',
      data: jobs,
    };
  }

  async getJurisdictions() {
    const jurisdictions = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          nombre
        FROM jurisdicciones
        WHERE habilitado = true
      `,
    );
    return {
      message: 'Jurisdicciones obtenidas correctamente',
      data: jurisdictions,
    };
  }

  async updatePhone(dto: any, user: any) {
    const { id } = user;
    const { celular: phone } = dto;
    return await this.external.updateExternalPhone(id, phone);
  }
}

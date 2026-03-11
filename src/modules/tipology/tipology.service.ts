import { Injectable } from '@nestjs/common';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class TipologyService {
  constructor(private readonly sql: SqlService) {}

  async getAll() {
    const types = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          REPLACE(descripcion, 'S - ', '') AS descripcion,
          CAST("unidadId" AS INT) AS unidad_id,
          codigo
        FROM tipo_casos
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    const subtypes = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          CAST("tipoCasoId" AS INT) AS tipo_caso_id,
          descripcion,
          codigo
        FROM sub_tipo_casos
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    const subtypesByType = new Map<number, any[]>();
    for (const s of subtypes) {
      if (!subtypesByType.has(s.tipo_caso_id))
        subtypesByType.set(s.tipo_caso_id, []);
      subtypesByType.get(s.tipo_caso_id)!.push(s);
    }
    const data = types.map((t) => ({
      ...t,
      subtipos: subtypesByType.get(t.id) ?? [],
    }));
    return {
      message: 'Tipos de caso obtenidos correctamente',
      data,
      totalCount: data.length,
    };
  }

  async getReports() {
    const reports = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM tipo_reportantes
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Tipos de reportante obtenidos correctamente',
      data: reports,
    };
  }

  async getSubTypes() {
    const subtypes = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion,
          CAST("tipoCasoId" AS INT) AS tipo_caso_id
        FROM sub_tipo_casos
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Subtipos de caso obtenidos correctamente',
      data: subtypes,
    };
  }

  async getUnits() {
    const units = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM unidades
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Unidades obtenidas correctamente',
      data: units,
    };
  }
}

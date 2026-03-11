import { Injectable } from '@nestjs/common';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class ProcessService {
  constructor(private readonly sql: SqlService) {}

  async getMeans() {
    const means = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          codigo,
          descripcion
        FROM medio_reportes
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Medios obtenidos correctamente',
      data: means,
    };
  }

  async getMeanCodeById(id: number) {
    const mean = await this.sql.query(
      `
        SELECT codigo
        FROM medio_reportes
        WHERE id = @id
      `,
      { id },
    );
    return mean[0]?.codigo;
  }

  async getOperators() {
    const operators = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion,
          CAST("medioId" AS INT) AS medio_id
        FROM operadores
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Operadores obtenidos correctamente',
      data: operators,
    };
  }

  async getSituations() {
    const situations = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM estado_incidencias
        WHERE habilitado = true
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Situaciones obtenidas correctamente',
      data: situations,
    };
  }
}

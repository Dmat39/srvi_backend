import { Injectable } from '@nestjs/common';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class InformationService {
  constructor(private readonly sql: SqlService) {}

  async getGender() {
    const genders = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM genero_agresores
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Géneros obtenidos correctamente',
      data: genders,
    };
  }

  async getProcessSeverities() {
    const states = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM severidad_procesos
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Estados de proceso obtenidos correctamente',
      data: states,
    };
  }

  async getProcessStates() {
    const states = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM estado_procesos
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Procesos de severidad obtenidos correctamente',
      data: states,
    };
  }

  async getSeverities() {
    const states = await this.sql.query(
      `
        SELECT
          CAST(id AS INT) AS id,
          descripcion
        FROM severidades
        ORDER BY descripcion ASC
      `,
    );
    return {
      message: 'Severidades obtenidas correctamente',
      data: states,
    };
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Shift, Status } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import {
  CreateIncidenceDto,
  FilterIncidenceDto,
  UpdateIncidenceDto,
} from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SqlService } from '../sql/sql.service';
import { ProcessService } from '../process/process.service';
import { TipologyService } from '../tipology/tipology.service';
import {
  generateDirectory,
  generateFilename,
  getCurrentDate,
  getOriginPath,
  getPreviousDate,
  getResolvedFilePath,
  getYear,
  paginationHelper,
  timezoneHelper,
  timezoneHelperFromDateTime,
} from '../../common/helpers';
import { ExternalService } from '../external/external.service';
import { getCrimeDataBySubtypology, getZone } from './helpers';

@Injectable()
export class IncidenceService {
  constructor(
    private readonly config: ConfigService,
    private readonly external: ExternalService,
    private readonly event: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly sql: SqlService,
    private readonly processService: ProcessService,
    private readonly typologyService: TipologyService,
  ) {}

  async create(dto: CreateIncidenceDto, files: Array<Express.Multer.File>) {
    const { fecha_ocurrencia, hora_ocurrencia, ...res } = dto;
    const { currentDate, uploadDir, date } = generateDirectory(this.config);
    const evidences: any[] = [];
    if (!files || files.length === 0)
      throw new BadRequestException('Es necesario enviar evidencias');
    files.map((file) => {
      const uniqueName = generateFilename(file.originalname);
      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, file.buffer);
      evidences.push(`preincidencias/fotos/${currentDate}/${uniqueName}`);
    });
    const incidence = await this.prisma.incidencias.create({
      data: {
        ...res,
        doneAt: timezoneHelperFromDateTime(fecha_ocurrencia, hora_ocurrencia),
        fotos: evidences,
        estado: Status.PENDIENTE,
        createdAt: date,
        updatedAt: date,
      },
    });
    this.event.emit('incidence.created', incidence);
    return {
      message: 'Incidencia creada correctamente',
      data: incidence,
    };
  }

  async getAllPending(dto: FilterIncidenceDto) {
    const { search, jurisdiccion, page, limit } = dto;
    const where: any = { estado: Status.PENDIENTE };
    if (search) where.descripcion = { contains: search, mode: 'insensitive' };
    if (jurisdiccion) where.jurisdiccion_id = jurisdiccion;
    return await paginationHelper(
      this.prisma.incidencias,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      { page, limit },
    );
  }

  async getAllByShield(id: number, dto: FilterIncidenceDto) {
    const { fecha_inicio, fecha_fin, estado } = dto;
    if (!fecha_inicio || !fecha_fin)
      throw new BadRequestException('Es necesario el rango de fechas');
    const start = new Date(`${fecha_inicio}T00:00:00.000Z`);
    const end = new Date(`${fecha_fin}T23:59:59.999Z`);
    const where: any = {
      sereno_id: id,
      doneAt: {
        gte: start,
        lte: end,
      },
    };
    if (estado) where.estado = estado;
    const incidences = await this.prisma.incidencias.findMany({
      where,
      select: {
        id: true,
        descripcion: true,
        fecha_ocurrencia: true,
        hora_ocurrencia: true,
        direccion: true,
        latitud: true,
        longitud: true,
        codigo_incidencia: true,
        estado: true,
        fotos: true,
        jurisdiccion_id: true,
        tipo_caso_id: true,
        sub_tipo_caso_id: true,
        doneAt: true,
      },
    });
    if (incidences.length === 0)
      return {
        success: false,
        data: [],
        countState: 0,
      };
    const { data: types } = await this.typologyService.getAll();
    const typeMap = new Map(types.map((t) => [t.id, t]));
    let pending = 0,
      approved = 0,
      disapproved = 0;
    const result = incidences.map((inc) => {
      const type = typeMap.get(inc.tipo_caso_id);
      const subtype = type?.subtipos?.find(
        (s: any) => s.id === inc.sub_tipo_caso_id,
      );
      switch (inc.estado) {
        case Status.PENDIENTE:
          pending++;
          break;
        case Status.APROBADO:
          approved++;
          break;
        default:
          disapproved++;
      }
      return {
        ...inc,
        tipo: type?.descripcion ?? null,
        subtipo: subtype?.descripcion ?? null,
      };
    });
    return {
      success: true,
      data: result,
      countState: {
        PENDIENTE: pending,
        APROBADO: approved,
        RECHAZADO: disapproved,
      },
    };
  }

  async getHistorial(dto: FilterIncidenceDto) {
    const { fecha: date, turno: shift = Shift.MANANA } = dto;
    const dateRegister = date ?? getCurrentDate();
    const datePrevious = getPreviousDate(dateRegister);
    const where: any = {
      estado: Status.APROBADO,
      ...this.whereTime(shift, dateRegister, datePrevious),
    };
    const incidences = await this.prisma.incidencias.findMany({
      where,
      select: {
        codigo_incidencia: true,
        jurisdiccion_id: true,
        nombre_reportante: true,
        sereno_id: true,
      },
      orderBy: { jurisdiccion_id: 'asc' },
    });
    const jurisdiccionMap = new Map();
    for (const inc of incidences) {
      const {
        jurisdiccion_id,
        sereno_id,
        nombre_reportante,
        codigo_incidencia,
      } = inc;
      if (!jurisdiccionMap.has(jurisdiccion_id))
        jurisdiccionMap.set(jurisdiccion_id, new Map());
      const serenoMap = jurisdiccionMap.get(jurisdiccion_id)!;
      if (!serenoMap.has(sereno_id))
        serenoMap.set(sereno_id, {
          sereno_id,
          nombre_reportante,
          codigo_incidencias: [],
        });
      serenoMap.get(sereno_id)!.codigo_incidencias.push(codigo_incidencia);
    }
    return Array.from(jurisdiccionMap.entries()).map(
      ([jurisdiccion_id, serenoMap]) => ({
        jurisdiccion_id,
        users: Array.from(serenoMap.values()),
      }),
    );
  }

  async getOne(id: string) {
    return await this.getIncidenceById(id);
  }

  getFile(path: string[] | string): string {
    return getResolvedFilePath(this.config, path);
  }

  async update(id: string, dto: UpdateIncidenceDto) {
    await this.getIncidenceById(id);
    const incidence = await this.prisma.incidencias.update({
      data: dto,
      where: { id },
    });
    return {
      message: 'Incidencia actualizada correctamente',
      data: incidence,
    };
  }

  async review(args: any, socketId: string) {
    const { id, user_id } = args;
    const incidence = await this.getIncidenceById(id);
    await this.prisma.incidencias.update({
      data: {
        estado: Status.EN_REVISION,
        locked_by: Number(user_id),
        socket_id: socketId,
      },
      where: { id },
    });
    return incidence;
  }

  async cancel(args: any) {
    const { id, user_id } = args;
    const incidence = await this.getIncidenceById(id);
    if (incidence.estado !== Status.EN_REVISION)
      throw new BadRequestException('No puedes cancelar esta incidencia.');
    await this.prisma.incidencias.update({
      data: {
        estado: Status.PENDIENTE,
        locked_by: null,
        socket_id: null,
      },
      where: { id },
    });
    return incidence;
  }

  async disapprove(args: any) {
    const { id, user_id } = args;
    await this.getIncidenceById(id);
    await this.prisma.incidencias.update({
      data: {
        isDeleted: true,
        estado: Status.RECHAZADO,
        user_id: String(user_id),
      },
      where: { id },
    });
    return {
      message: 'Incidencia rechazada correctamente',
      success: true,
    };
  }

  async approve(id: string, dto: UpdateIncidenceDto, user: any) {
    const { id: user_id } = user;
    const { fecha_ocurrencia, hora_ocurrencia, ...res } = dto;
    const incidence = await this.getIncidenceById(id);
    let doneAt: Date | null;
    if (fecha_ocurrencia && hora_ocurrencia)
      doneAt = timezoneHelperFromDateTime(fecha_ocurrencia, hora_ocurrencia);
    else doneAt = incidence.doneAt;
    const meanId = dto.medio_id ?? incidence.medio_id;
    if (!meanId) {
      throw new BadRequestException('Debes seleccionar un medio');
    }
    const meanCode = await this.processService.getMeanCodeById(meanId);
    const year = getYear();
    const lastCode = await this.sql.query(
      `
        SELECT "codigoIncidencia" AS codigo_incidencia
        FROM incidencias
        WHERE "codigoIncidencia" LIKE @code || @year || '%'
        ORDER BY "codigoIncidencia" DESC
        LIMIT 1
      `,
      { code: meanCode, year },
    );
    const date = timezoneHelper();
    let newNumber = 1;
    if (lastCode.length > 0) {
      const lastIncidenceCode = lastCode[0].codigo_incidencia;
      const [, correlativo] = lastIncidenceCode.split(year);
      newNumber = Number(correlativo) + 1;
    }
    const codeString = `${meanCode}${year}${newNumber.toString().padStart(6, '0')}`;
    const incidenceRegistered = await this.sql.query(
      `
        INSERT INTO incidencias (
          "codigoIncidencia", descripcion, direccion,
          "estadoProcesoId", "generoAgresorId", "generoVictimaId",
          "jurisdiccionId", latitud, longitud, "medioId",
          "nombreReportante", "operadorId", "severidadId",
          "severidadProcesoId", "situacionId", "subTipoCasoId",
          "telefonoReportante", "tipoCasoId", "tipoReportanteId", "unidadId",
          "ocurridoEn", "registradoEn", "atendidoEn",
          "createdAt", "updatedAt"
        )
        VALUES (
          @codigo_incidencia, @descripcion, @direccion,
          @estado_proceso_id, @genero_agresor_id, @genero_victima_id,
          @jurisdiccion_id, @latitud, @longitud, @medio_id,
          @nombre_reportante, @operador_id, @severidad_id,
          @severidad_proceso_id, @situacion_id, @sub_tipo_caso_id,
          @telefono_reportante, @tipo_caso_id, @tipo_reportante_id, @unidad_id,
          @doneAt, @date, @date,
          NOW(), NOW()
        )
        RETURNING id
      `,
      {
        codigo_incidencia: codeString,
        descripcion: dto.descripcion ?? incidence.descripcion,
        direccion: dto.direccion ?? incidence.direccion,
        estado_proceso_id: dto.estado_proceso_id,
        genero_agresor_id: dto.genero_agresor_id ?? 3,
        genero_victima_id: dto.genero_victima_id ?? 3,
        jurisdiccion_id: dto.jurisdiccion_id ?? incidence.jurisdiccion_id,
        latitud: dto.latitud ?? incidence.latitud,
        longitud: dto.longitud ?? incidence.longitud,
        medio_id: dto.medio_id ?? incidence.medio_id,
        nombre_reportante: dto.nombre_reportante ?? incidence.nombre_reportante,
        operador_id: dto.operador_id ?? incidence.operador_id,
        severidad_id: dto.severidad_id ?? incidence.severidad_id,
        severidad_proceso_id: dto.severidad_proceso_id ?? incidence.severidad_proceso_id,
        situacion_id: dto.situacion_id ?? incidence.situacion_id,
        sub_tipo_caso_id: dto.sub_tipo_caso_id ?? incidence.sub_tipo_caso_id,
        telefono_reportante: dto.telefono_reportante ?? incidence.telefono_reportante,
        tipo_caso_id: dto.tipo_caso_id ?? incidence.tipo_caso_id,
        tipo_reportante_id: dto.tipo_reportante_id ?? incidence.tipo_reportante_id,
        unidad_id: incidence.unidad_id,
        doneAt,
        date,
      },
    );
    await this.prisma.incidencias.update({
      data: {
        ...res,
        estado: Status.APROBADO,
        doneAt,
        convertidaAIncidencia: true,
        codigo_incidencia: codeString,
        user_id: String(user_id),
        registerAt: date,
      },
      where: { id },
    });
    const files = incidence.fotos;
    for (const file of files) {
      const origin = getOriginPath(this.config, file);
      const filename = path.basename(origin);
      const destinity = this.config.get<string>('EXTERNAL_FILES_PATH');
      if (!destinity)
        throw new InternalServerErrorException('Variable interna no definida');
      const final = path.join(destinity, filename);
      fs.copyFileSync(origin, final);
      await this.sql.query(
        `
          INSERT INTO evidencias (
            "incidenciaId", "nombreArchivo", "fechaHoraRegistro",
            "createdAt", "updatedAt"
          )
          VALUES (
            @incidencia_id, @nombre_archivo, NOW(),
            NOW(), NOW()
          );
        `,
        {
          incidencia_id: incidenceRegistered[0].id,
          nombre_archivo: filename,
        },
      );
    }
    const crime = getCrimeDataBySubtypology(incidence.sub_tipo_caso_id ?? 1);
    if (!crime) return;
    const zoneId = getZone(incidence.jurisdiccion_id);
    const token = await this.external.getExternalToken();
    const incidenceId = await this.external.createExternalIncidence(
      {
        code: codeString,
        name: crime.name,
        description: incidence.descripcion,
        date: incidence.doneAt,
        latitude: String(incidence.latitud),
        longitude: String(incidence.longitud),
        communicationId: 'b816cfb6-5d04-4d24-92d4-69968d55bdf0',
        crimeId: crime.crime_id,
        zoneId,
      },
      token,
    );
    const data = new FormData();
    data.append('descripcion', 'Registro inicial');
    data.append('date', incidence.doneAt?.toISOString() ?? '');
    data.append('incidenceId', incidenceId);
    files.forEach((file) => {
      const origin = getOriginPath(this.config, file);
      data.append('files', fs.createReadStream(origin));
    });
    await this.external.createExternalRegister(data, token);
  }

  private formatTime(date: Date | null) {
    return date ? date.toISOString().split('T')[1] : null;
  }

  private formatDate(date: Date | null) {
    return date ? date.toISOString().split('T')[0] : null;
  }

  private async getIncidenceById(id: string) {
    const incidence = await this.prisma.incidencias.findFirst({
      where: { id },
    });
    if (!incidence) throw new BadRequestException('Incidencia no encontrada');
    return incidence;
  }

  private whereTime(shift: Shift, dateRegister: string, datePrevious: string) {
    switch (shift) {
      case Shift.MANANA:
        return {
          registerAt: {
            gte: this.startOf(dateRegister, 6),
            lt: this.startOf(dateRegister, 14),
          },
        };
      case Shift.TARDE:
        return {
          registerAt: {
            gte: this.startOf(dateRegister, 14),
            lt: this.startOf(dateRegister, 22),
          },
        };
      case Shift.NOCHE:
        return {
          registerAt: {
            gte: this.startOf(datePrevious, 22),
            lt: this.startOf(dateRegister, 6),
          },
        };
      default:
        throw new BadRequestException('Turno inválido');
    }
  }

  private startOf(date: string, hour: number) {
    const day = new Date(`${date}T00:00:00.000Z`);
    day.setUTCHours(hour, 0, 0, 0);
    return day;
  }
}

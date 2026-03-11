import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IncidenceService } from './incidence.service';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: { origin: '*' } })
export class IncidenceGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly incidenceService: IncidenceService) {}

  @SubscribeMessage('traer-preincidencias')
  async traerPreincidencias(@ConnectedSocket() socket: Socket) {
    const all = await this.incidenceService.getAllPending({
      page: 0,
      limit: 10,
    });
    socket.emit('data-inicial', all);
  }

  @SubscribeMessage('select-preincidencia')
  async selectPreincidencia(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    const { args, callback } = this.normalizeAck(body);
    try {
      const incidencia = await this.incidenceService.review(args, socket.id);
      this.server.emit('preincidencia-seleccionada', { id: incidencia.id });
      return (
        callback?.({ status: 'ok', data: incidencia }) ?? {
          status: 'ok',
          data: incidencia,
        }
      );
    } catch (e: any) {
      const payload = {
        status: 'error',
        message:
          e?.message || 'Ocurrió un error al seleccionar la preincidencia.',
      };
      return callback?.(payload) ?? payload;
    }
  }

  @SubscribeMessage('cancelar-preincidencia')
  async cancelarPreincidencia(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    const { args, callback } = this.normalizeAck(body);
    try {
      const incidencia = await this.incidenceService.cancel(args);
      this.server.emit('preincidencia-cancelada', incidencia);
      return (
        callback?.({ status: 'ok', data: incidencia }) ?? {
          status: 'ok',
          data: incidencia,
        }
      );
    } catch (e: any) {
      const payload = {
        status: 'error',
        message: e?.message || 'Ocurrió un error al cancelar la preincidencia.',
      };
      return callback?.(payload) ?? payload;
    }
  }

  @SubscribeMessage('eliminar-preincidencia')
  async eliminarPreincidencia(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    const { args, callback } = this.normalizeAck(body);
    try {
      const incidencia = await this.incidenceService.getOne(args.id);
      await this.incidenceService.disapprove(args);
      this.server.emit('preincidencia-eliminada', { id: incidencia.id });
      return (
        callback?.({ status: 'ok', data: incidencia }) ?? {
          status: 'ok',
          data: incidencia,
        }
      );
    } catch (e: any) {
      const payload = {
        status: 'error',
        message: e?.message || 'Ocurrió un error al eliminar la preincidencia.',
      };
      return callback?.(payload) ?? payload;
    }
  }

  @SubscribeMessage('Emitir actualizacion')
  emitirActualizacion() {
    this.server.emit('actualizacion', {
      status: 'Ok',
      message: 'Actualizando',
    });
    return { status: 'ok' };
  }

  private normalizeAck(body: any): { args: any; callback?: (x: any) => any } {
    if (body && typeof body === 'object' && 'args' in body)
      return { args: body.args, callback: body.callback };
    return { args: body };
  }

  @OnEvent('incidence.created')
  emitIncidence(preincidencia: any) {
    this.server.emit('agregar-preincidencia', preincidencia);
  }
}

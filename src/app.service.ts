import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInitial(): any {
    return {
      message:
        'Welcome to the Server Incident Registration and Validation System',
      success: true,
    };
  }
}

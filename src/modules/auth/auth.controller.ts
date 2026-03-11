import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('external')
  loginExternal(@Body() dto: LoginDto) {
    return this.authService.loginExternal(dto);
  }

  @Post('user')
  loginUser(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }
}

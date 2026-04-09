import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 @Post('register')
register(@Body() body: any) {
  return this.authService.register(
    body.name,
    body.email,
    body.phone,
    body.password,
    body.role,
  );
}
  @Public()   // ✅ ADD THIS
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }
}


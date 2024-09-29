import { Body, Controller, Get, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '@prisma/client';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { META_ROLES, RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  loginUser(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }


  @Get('private')
  @UseGuards(JwtAuthGuard)
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {

    // console.log(request);
    return {
      ok: true,
      message: 'hola mundo privado',
      user,
      userEmail,
      rawHeaders
    }
  }


  @Get('private2')
  // @SetMetadata(META_ROLES, ['admin','super-user'])
  @RoleProtected(ValidRoles.user)
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  testinPrivateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'hola mundo privado',
      user,
    }
  }

  @Get('private3')
 @Auth(ValidRoles.superUser)
  testinPrivateRoute3(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'hola mundo privado',
      user,
    }
  }

} 
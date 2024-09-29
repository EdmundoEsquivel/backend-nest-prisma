import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService, configService: ConfigService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey:configService.get('JWT_SECRET'),
        });
      }


      async validate(payload: { payload: { userId: string, email: string } }) {
        const { userId } = payload.payload; // Accediendo a payload anidado
        
        // console.log("El id es:", userId); // Debugging del userId

        const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Token no valido');
      }
    if (!user.isActive){
        throw new UnauthorizedException('Usuario no activo, llama al administrador');
    }
    
    const { password, ...usuario } = user;

    // console.log("El usuario es:", usuario); // Debugging del usuario


    return usuario;
  }
  
}
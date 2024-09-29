//src/auth/auth.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

  async login(email: string, password: string) : Promise<AuthEntity> {
    // Step 1: Fetch a user with the given email
    const user = await this.prisma.user.findUnique({ 
      where: { email: email },
    select:{
      id: true,
      email: true,
      password: true,
    } });

    //  console.log(user); 
    // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    // Step 2: Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);


    // If password does not match, throw an error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Step 3: Generate a JWT containing the user's ID and return it
    return {
      // ...user, 
      accessToken: this.getJwtToken({
        email: user.email,
        userId: user.id,
        }),
    };
  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign({ payload });
    return token;

  }

  checkAuthStatus(user: User) {
    return {
      accessToken: this.getJwtToken({
        email: user.email,
        userId: user.id,
        }),
    };
  }

} 
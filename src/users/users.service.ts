
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {

    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );

      createUserDto.password = hashedPassword;
      console.log(createUserDto);
      return await this.prisma.user.create({ data: createUserDto });

    } catch (error) {
      console.log("ocurrio un error")
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  private handleDBExceptions(error: any): never {
    console.log(error)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.code === 'P2002') {
      throw new BadRequestException({"El campo repetido": error.meta.target[0]});
    }

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}

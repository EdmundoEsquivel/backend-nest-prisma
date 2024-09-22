import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import myPrisma from './prisma/product.prisma';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'
import { ProductEntity } from './entities/product.entity';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    try {
      // Extraer imágenes del DTO
      const { images = [], ...productData } = createProductDto;

      // Crear el producto con las imágenes
      const newProduct = await myPrisma.product.create({
        data: {
          ...productData,
          images: {
            create: images.map(imageUrl => ({ url: imageUrl })),  // Crear las imágenes a partir de URLs
          },
        },
        include: {
          images: true,  // Incluir las imágenes en la respuesta
        },
      });

      return { ...newProduct, images: images }; // Retornar el producto con las imágenes
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(PaginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = PaginationDto;
    const products = await this.prisma.product.findMany(
      {
        take: limit,
        skip: offset,
        include: {
          images: true,
        },
      }
    );

    return products.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product
    if (isUUID(term)) {
      product = await this.prisma.product.findUnique({
        relationLoadStrategy: 'join',
        where: { id: term },
        include: { images: true }
      });
    }
    else {
      // Transformar el término a minúsculas y mayúsculas
      const title = term.toUpperCase();
      const slug = term.toLowerCase();
      // Realizar la consulta con Prisma
      product = await this.prisma.product.findFirst({
        relationLoadStrategy: 'join',
        where: {
          OR: [
            {
              title: { equals: title, mode: 'insensitive' }  // Insensible a mayúsculas/minúsculas
            },
            {
              slug: slug,
            },
          ],
        },
        include: {
          images: true, // Incluir las imágenes relacionadas
        },
      });

    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }

    return product;
  }


async findOnePlain(term: string) {
    const product1 = await this.findOne(term );
    const { images = [], ...rest } = product1;
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {
    // Buscar el producto existente
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    try {
      // Actualizar el producto
      const updatedProduct = await myPrisma.product.update({
        where: { id },
        data: updateProductDto
      });
      return updatedProduct;
    } catch (error) {
      this.handleDBExceptions(error); // Define tu función para manejar excepciones de DB
    }
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ${id} not found`);
    }
    await this.prisma.product.delete({ where: { id } });
  }

  private handleDBExceptions(error: any) {
    console.log(error)
    if (error.code === 'P2002') {
      throw new BadRequestException('El producto ya existe');
    }
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

}

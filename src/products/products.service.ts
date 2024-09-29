import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import myPrisma from './prisma/product.prisma';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'
import { User } from '@prisma/client';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto, user: User) {
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
          user: { connect: { id: user.id } },  // Conectar el producto con el usuario   
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
          user: {
            select: {
              id: true,         // Incluye el campo 'id'
              name: true,       // Incluye el campo 'name'
              email: true,      // Incluye el campo 'email'
              // No incluir el campo 'password'
            },
          }
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


  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // Buscar el producto existente
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true }, // Incluir las imágenes relacionadas
    });
  
    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
  
    const { images = [], ...productData } = updateProductDto;
  
    try {
      // Iniciar una transacción para asegurar que las operaciones se hagan juntas
      const updatedProduct = await this.prisma.$transaction(async (prisma) => {
        // Actualizar el producto principal sin imágenes
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...productData,
            userId: user.id, // Asegurar que el usuario actual es el propietario
          }, // Actualizar el resto de los campos
          include: { images: true }, // Incluir las imágenes actuales en el retorno
        });
  
        if (images && images.length > 0) {
          // Eliminar las imágenes existentes
          await prisma.product_image.deleteMany({
            where: { productId: id },
          });
  
          // Insertar las nuevas imágenes
          const imageCreates = images.map((url) => ({
            url,
            productId: id,
          }));
  
          await prisma.product_image.createMany({
            data: imageCreates,
          });
        }
  
        // Retornar el producto actualizado dentro de la transacción
        return prisma.product.findUnique({
          where: { id },
          include: { images: true }, // Asegurar que se incluyan las nuevas imágenes
        });
      });
  
      // Extraer las imágenes del producto y retornar en formato plano
      const { images: updatedImages = [], ...rest } = updatedProduct;
      return {
        ...rest,
        images: updatedImages.map(image => image.url) // Retornar las URLs de las imágenes
      };
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

  async deleteAllProducts() {
    try {
      // Eliminar todos los productos usando Prisma
      return await this.prisma.product.deleteMany({});
    } catch (error) {
      this.handleDBExceptions(error); // Manejar las excepciones de la base de datos
    }
  }
  

}

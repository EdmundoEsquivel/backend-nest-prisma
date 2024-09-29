import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService
  ) { }

  async runSeed() {
    
     const user = await this.daPrimerUsuario();
    await this.insertNewProducts(user);
     return "SEED EJECUTADO";
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product, user ) );
    });

    await Promise.all(insertPromises);

    return true;
  }

  private async daPrimerUsuario() { 
  const user = await this.usersService.findAll();
   return user[0];
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';



@Module({
  imports: [ 
    
    ServeStaticModule.forRoot({
    rootPath: join(__dirname,'../..','public'), 
  })
  ,ProductsModule, PrismaModule, ArticlesModule, UsersModule, AuthModule, CommonModule, SeedModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],

  
})
export class AppModule {}

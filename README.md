<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Comisaria API
1.- Levantar la Base de Datos 
```
docker-compose up -d
```

2- Instalar Prisma
//instala Prisma
```
npm install prisma --save-dev
```

//Inicializa Prisma
```
npx prisma init
```

//Relaliza la primer migracion 
```
npx prisma migrate dev --name init
```

3.- crear las variables de entorno
```
npm i @nestjs/config
```

4. Vamos a crear y ahorrarse tiempo y generar un recuros con todos los api 
```
nest g res products --no-spec
```

//PAra documentar el API con swagger
//Instalar dependencias 
```
npm install --save @nestjs/swagger
```

Integrar en main.ts esta linea 
```
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
```

//antes del await listen 
```
const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
```

//Corregir error de CORS
en main.ts
```
app.enableCors()
```

//instala el validator 
```
npm i --save class-validator class-transformer
```


Seed
Creo el archivo seed.ts dentro de la capreta prisma

iserto la accion dentro del package.json 
```
"prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
```

ejecturo el seed
```
npx prisma db seed
```

Nesesito generar el modulo y el servicio dentro de la carpeta de prisma
```
npx nest generate module prisma
npx nest generate service prisma
```

Instalar y configurar passport
```
npm install --save @nestjs/passport passport @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
```

Hashing de contraseñas
```
npm install bcrypt
npm install --save-dev @types/bcrypt
```

Instalar y usar en Type UUID
```
npm install uuid
 npm i --save-dev @types/uuid   
```

Trabajar con la carga de archivos
```
npm i -D @types/multer  
```


Servir contenido statico 
```
npm i @nestjs/serve-static
```

Crear un gard identificando una carpeta especifica
```
nest g gu auth/guards/userRole --no-spec
```


Crear un decorador una carpeta especifica
```
nest g d auth/decorators/roleProtected --no-spec
```

Vamos a trabajar con WebSockets 
```
npm i --save @nestjs/websockets @nestjs/platform-socket.io
npm add socket.io
```
Instalo dependencias y creo un nuevo recurso
```
nest g res messagesWs --no-spec
```

crear una aplicacion en vite TS
```
npm create vite 
-name
-vite
-typescript

npm install dependencias

instalar el cliente de io 
npm add socket.io-client

```
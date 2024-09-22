import { PrismaClient } from '@prisma/client';

const originalPrisma = new PrismaClient();

const myPrisma = originalPrisma.$extends({
  model: {
    product: {
      create: async function (args) {
        // Hook similar a `@BeforeInsert`
        if (!args.data.slug) {
          args.data.slug = args.data.title
        }
        args.data.slug = args.data.slug.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
        // Llamada al método `create` original de Prisma
        return originalPrisma.product.create(args);
      },
      update: async function (args) {
        // Hook similar a `@BeforeUpdate`
        if (!args.data.slug) {
          args.data.slug = args.data.title
        }
        args.data.slug = args.data.slug.toLowerCase().replace(/ /g, '_').replace(/'/g, '');

        // Llamada al método `update` original de Prisma
        return originalPrisma.product.update(args);
      },
    },
  },
});

export default myPrisma;

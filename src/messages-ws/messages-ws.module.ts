import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [AuthModule, PrismaModule],
})
export class MessagesWsModule {}

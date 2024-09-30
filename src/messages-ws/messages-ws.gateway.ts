import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { newMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwsService: JwtService
  ) {

  }
  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      payload = this.jwsService.verify(token);
      await this.messagesWsService.registerClient(client, payload.userId);

    } catch (error) {
      client.disconnect(true);
      return;
    }


    // console.log({ payload });

    // console.log(`Client connected: ${client.id}`);

    // console.log('connected-clients', this.messagesWsService.getConnectedClients());

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());

  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: newMessageDto) {

    //!Emite mensaje unicamente al clente 
    //  client.emit('message-from-server', {
    //   fullname: 'Soy Yo',
    //   message: payload.message|| 'No hay mensaje'
    //  }); 

    //!Emite mensaje a todos menos al que lo emitio
    // client.broadcast.emit('message-from-server', {
    //   fullname: 'Soy Yo',
    //   message: payload.message || 'No hay mensaje'
    // });

    //!Emite mensaje a todos los clientes conectados
    this.wss.emit('message-from-server', {
      fullname: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No hay mensaje'
    });

  }
}

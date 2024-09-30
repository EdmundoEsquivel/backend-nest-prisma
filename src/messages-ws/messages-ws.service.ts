import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    };
}
@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};
    constructor(private prisma: PrismaService) { }

    async registerClient(client: Socket, userId: string) {

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new Error('User no encontrado'); }
        if (!user.isActive) { throw new Error('User no esta activo'); }

        this.checkUserConection(user);
        //    console.log('registerClient', user);
        this.connectedClients[client.id] = {
            socket: client,
            user: user
        };
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        // console.log(this.connectedClients);
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string) {
        return this.connectedClients[socketId].user.name;
    }

    private checkUserConection(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {

            const connectedClient = this.connectedClients[clientId];

            if (connectedClient.user.id === user.id) {
                connectedClient.socket.disconnect(true);
                break;

            }

        }
    }
}

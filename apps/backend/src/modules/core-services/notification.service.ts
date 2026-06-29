import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async sendToUser(userId: string, title: string, message: string) {
    this.socketGateway.broadcast('notification.user', {
      userId,
      title,
      message,
      timestamp: new Date(),
    });
  }

  async sendAdminAlert(title: string, message: string) {
    this.socketGateway.broadcast('notification.admin', {
      title,
      message,
      timestamp: new Date(),
    });
  }

  async sendSystemAlert(title: string, message: string) {
    this.socketGateway.broadcast('notification.system', {
      title,
      message,
      timestamp: new Date(),
    });
  }
}

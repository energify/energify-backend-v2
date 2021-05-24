import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { WsAuthedUser } from '../auth/decorators/ws-authed-user.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { StoreMeasureDto } from './dto/store-measure.dto';
import { MeasuresService } from './measures.service';

@WebSocketGateway(6379, { namespace: 'measures' })
export class MeasuresGateway implements OnGatewayConnection {
  constructor(private measuresService: MeasuresService, private authService: AuthService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization;
    console.log(client.handshake);
    if (this.authService.verify(token)) {
      (client.handshake as any).user = this.authService.decode(token);
    } else {
      client.disconnect();
    }
  }

  @SubscribeMessage('store')
  store(@WsAuthedUser() user: IUser, @MessageBody() dto: StoreMeasureDto) {
    return this.measuresService.store(user.id, dto);
  }

  @SubscribeMessage('store-bulk')
  storeBulk(@WsAuthedUser() user: IUser, @MessageBody() dto: StoreMeasureDto[]) {
    return this.measuresService.storeBulk(user.id, dto);
  }
}

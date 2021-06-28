import { Types } from 'mongoose';
import { IPrice } from '../../users/interfaces/iprices.interface';
import { Measure } from '../schemas/measure.schema';
import { LpfLafPolicy } from './lpflaf-policy.model';

describe('Matching Policy', () => {
  let policy = new LpfLafPolicy();
  let orders: (Measure & IPrice)[] = [];

  for (let i = 0; i < 1000; i++) {
    orders.push({
      id: undefined,
      userId: new Types.ObjectId(),
      measuredAt: new Date(),
      buyPrice: parseFloat((Math.random() * (0.173 - 0.171) + 0.171).toFixed(3)),
      sellPrice: parseFloat((Math.random() * (0.173 - 0.171) + 0.171).toFixed(3)),
      value:
        Math.random() > 0.5
          ? parseFloat((Math.random() * (0.015 - 0.01) + 0.01).toFixed(4))
          : -parseFloat((Math.random() * (0.015 - 0.01) + 0.01).toFixed(4)),
    });
  }

  console.time('Time -> ');
  const matches = policy.match(orders);
  console.timeEnd('Time -> ');

  console.log(matches);
  console.log(matches.map((m) => !!m.consumerId && !!m.prosumerId).length);
});

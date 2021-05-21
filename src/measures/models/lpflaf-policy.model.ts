import { IPrice } from '../../users/interfaces/iprices.interface';
import { Measure } from '../schemas/measure.schema';
import { MatchingPolicy } from './matching-policy.model';

export class LpfLafPolicy extends MatchingPolicy {
  protected sortSellsByValue(sells: (Measure & IPrice)[]): (Measure & IPrice)[] {
    return sells.sort((a, b) => a.value - b.value);
  }

  protected sortBuysByPrice(buys: (Measure & IPrice)[]): (Measure & IPrice)[] {
    return buys.sort((a, b) => a.buyPrice - b.buyPrice);
  }

  protected sortBuysByValue(buys: (Measure & IPrice)[]): (Measure & IPrice)[] {
    return buys.sort((a, b) => b.buyPrice - a.buyPrice);
  }
}

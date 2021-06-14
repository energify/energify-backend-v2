import { IPrice } from '../../users/interfaces/iprices.interface';
import { IMatch } from '../interfaces/imatch.interface';
import { Measure } from '../schemas/measure.schema';

export abstract class MatchingPolicy {
  private sells: (Measure & IPrice)[];
  private buys: (Measure & IPrice)[];

  public match(orders: (Measure & IPrice)[]) {
    const matches = new Array<IMatch>();
    this.sells = orders.filter((o) => o.value > 0);
    this.buys = this.sortBuysByPrice(orders.filter((o) => o.value < 0));

    for (const buy of this.buys) {
      const buys = this.sortBuysByValue(this.buys.filter((b) => b.buyPrice === buy.buyPrice));
      const sells = this.sortSellsByValue(this.sells.filter((s) => s.sellPrice <= buy.buyPrice));

      for (const buy of buys) {
        if (buy.value === 0) continue;

        for (const sell of sells) {
          if (buy.value === 0) break;
          else if (sell.value === 0) break;

          const supplied = Math.min(Math.abs(buy.value), sell.value);
          buy.value += supplied;
          sell.value -= supplied;
          matches.push({
            value: supplied,
            consumerId: buy.userId,
            prosumerId: sell.userId,
            matchedAt: buy.measuredAt,
            pricePerKw: sell.sellPrice,
          });
        }

        if (buy.value === 0) break;
        matches.push({
          value: buy.value * -1,
          consumerId: buy.userId,
          prosumerId: undefined,
          matchedAt: buy.measuredAt,
          pricePerKw: 0.21,
        });
      }
    }

    for (const sell of this.sells.filter((s) => s.value !== 0)) {
      matches.push({
        value: sell.value,
        consumerId: undefined,
        prosumerId: sell.userId,
        matchedAt: sell.measuredAt,
        pricePerKw: 0.21,
      });
    }

    return matches;
  }

  protected abstract sortSellsByValue(sells: (Measure & IPrice)[]): (Measure & IPrice)[];
  protected abstract sortBuysByPrice(buys: (Measure & IPrice)[]): (Measure & IPrice)[];
  protected abstract sortBuysByValue(buys: (Measure & IPrice)[]): (Measure & IPrice)[];
}

import { IsNumber, Min } from 'class-validator';

export class UpdatePricesDto {
  @Min(0.01)
  buyPrice: number;

  @Min(0.0)
  sellPrice: number;
}

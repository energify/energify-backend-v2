import { IsNumber, Min } from 'class-validator';

export class UpdatePricesDto {
  @Min(0.01)
  @IsNumber()
  buyPrice: number;

  @Min(0.0)
  @IsNumber()
  sellPrice: number;
}

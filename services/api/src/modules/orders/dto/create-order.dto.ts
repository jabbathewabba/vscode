import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}

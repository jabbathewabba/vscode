import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsNumber()
  taxPercent?: number;

  @IsOptional()
  @IsInt()
  maxPerOrder?: number;
}

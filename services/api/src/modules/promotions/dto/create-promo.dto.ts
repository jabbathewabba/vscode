import { IsString, IsOptional, IsNumber, IsDateString, IsInt } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  percentOff?: number;

  @IsOptional()
  @IsNumber()
  amountOff?: number;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsInt()
  usageLimit?: number;
}

import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

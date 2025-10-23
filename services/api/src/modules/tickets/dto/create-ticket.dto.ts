import { IsString, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  ticketTypeId: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

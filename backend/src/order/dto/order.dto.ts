import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class TicketRequestDto {
  @IsString()
  @IsNotEmpty()
  film!: string;

  @IsString()
  @IsNotEmpty()
  session!: string;

  @IsInt()
  @Min(1)
  row!: number;

  @IsInt()
  @Min(1)
  seat!: number;
}

export class TicketResponseDto {
  film!: string;
  session!: string;
  daytime!: string;
  row!: number;
  seat!: number;
  price!: number;
  id!: string;
}

export class OrderRequestDto {
  email!: string;
  phone!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TicketRequestDto)
  tickets!: TicketRequestDto[];
}

export class OrderResponseDto {
  total!: number;
  items!: TicketResponseDto[];
}

import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateProcedureDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  key!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  description!: string;
}

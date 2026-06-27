import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RateSessionDto {
  @ApiProperty({ description: 'Rating from 1 (worst) to 5 (best)', minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}

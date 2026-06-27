import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateExpertSessionDto {
  @ApiProperty({ description: 'UUID of the expert the citizen is contacting', example: 'expert-uuid' })
  @IsUUID()
  @IsNotEmpty()
  expertId!: string;

  @ApiPropertyOptional({ description: 'Topic or subject of the session', example: 'Labour contract dispute' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @ApiPropertyOptional({ description: 'Additional details or context', example: 'My employer has not paid me for 3 months.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateInterestDto {
  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;
}

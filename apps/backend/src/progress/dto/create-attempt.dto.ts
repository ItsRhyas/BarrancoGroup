import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @Length(1, 128)
  levelId: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  endingId?: string;
}

import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @MaxLength(128)
  sessionToken: string;

  @IsString()
  @MaxLength(128)
  levelId: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  endingId?: string;
}

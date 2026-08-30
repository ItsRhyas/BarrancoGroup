import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateAttemptDto {
  @IsUUID(undefined, { message: 'sessionToken debe ser un UUID válido' })
  sessionToken: string;

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

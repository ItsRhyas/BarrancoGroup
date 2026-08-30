import { IsOptional, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsUUID(undefined, { message: 'sessionToken debe ser un UUID válido' })
  sessionToken?: string;
}

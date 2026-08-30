import { IsUUID } from 'class-validator';

export class GetProgressQuery {
  @IsUUID(undefined, { message: 'sessionToken debe ser un UUID válido' })
  sessionToken: string;
}

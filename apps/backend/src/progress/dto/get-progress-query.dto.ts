import { IsString, MaxLength } from 'class-validator';

export class GetProgressQuery {
  @IsString()
  @MaxLength(128)
  sessionToken: string;
}

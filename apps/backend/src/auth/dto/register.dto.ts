import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Role } from '../role.enum';

export class RegisterDto {
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username solo admite letras, números y los símbolos . _ -',
  })
  username: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './role.enum';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash: this.passwords.hash(dto.password),
        role: dto.role ?? Role.USUARIO,
      },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (
      !user ||
      !user.passwordHash ||
      !this.passwords.verify(dto.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueToken(user);
  }

  private issueToken(user: {
    id: string;
    username: string | null;
    role: Role;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return { accessToken: this.jwt.sign(payload), role: user.role };
  }
}

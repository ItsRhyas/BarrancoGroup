import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  hash(plain: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
    return `${salt}:${hash}`;
  }

  verify(plain: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const expected = Buffer.from(hash, 'hex');
    const actual = scryptSync(plain, salt, KEY_LENGTH);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}

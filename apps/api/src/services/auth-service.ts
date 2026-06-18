import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http-errors.js';
import type { ITermRepository } from '../repositories/term-repository.interface.js';
export interface AuthPayload { sub: string; email: string; role: 'admin' }
export class AuthService { constructor(private readonly repo: ITermRepository, private readonly secret: string) {}
  async login(email: string, password: string) { const user = await this.repo.findUserByEmail(email); if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new UnauthorizedError('Invalid email or password'); const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role }; return { token: jwt.sign(payload, this.secret, { expiresIn: '8h' }), expires_in: 28800 }; }
  verifyToken(token: string) { return jwt.verify(token, this.secret) as AuthPayload; }
}

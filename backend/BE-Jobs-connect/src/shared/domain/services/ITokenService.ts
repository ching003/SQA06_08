export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
}

export interface ITokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
  decode(token: string): TokenPayload | null;
  getExpiresIn(): number;
}

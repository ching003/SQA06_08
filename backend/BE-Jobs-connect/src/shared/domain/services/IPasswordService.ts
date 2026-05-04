export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  validate(password: string): { isValid: boolean; errors: string[] };
}

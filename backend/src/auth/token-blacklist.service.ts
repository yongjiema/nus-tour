import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: string[] = [];

  addToBlacklist(token: string): void {
    this.blacklistedTokens.push(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.includes(token);
  }
}

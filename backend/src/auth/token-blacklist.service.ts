import { Injectable } from "@nestjs/common";

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();

  addToBlacklist(token: string): void {
    // Add token to blacklist
    this.blacklistedTokens.add(token);

    // Clean up old tokens periodically (basic implementation)
    if (this.blacklistedTokens.size > 10000) {
      // Keep only the last 5000 tokens to prevent memory issues
      const tokensArray = Array.from(this.blacklistedTokens);
      this.blacklistedTokens = new Set(tokensArray.slice(-5000));
    }
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Method to clear expired tokens (could be called by a scheduled task)
  clearExpiredTokens(): void {
    console.log("Token cleanup would happen here");
  }
}

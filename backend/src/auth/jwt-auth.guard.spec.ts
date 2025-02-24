import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;
  let authService: AuthService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret',
    });
    authService = {
      isTokenBlacklisted: jest.fn(),
    } as any;
    jwtAuthGuard = new JwtAuthGuard(jwtService, authService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if Authorization header is missing', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if Authorization header is not a string', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 123 } }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token format is invalid (missing Bearer)', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'InvalidHeader' } }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token format is invalid (Bearer but no token)', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer' } }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for a blacklisted token', () => {
    jest.spyOn(authService, 'isTokenBlacklisted').mockReturnValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer blacklistedtoken' } }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
    expect(authService.isTokenBlacklisted).toHaveBeenCalledWith('blacklistedtoken');
  });

  it('should throw UnauthorizedException if jwtService.verify throws an error', () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer invalidtoken' } }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow valid token and attach decoded user to request', () => {
    const mockDecoded = { sub: 1, email: 'test@example.com' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);
    jest.spyOn(authService, 'isTokenBlacklisted').mockReturnValue(false);

    const mockRequest = {
      headers: { authorization: 'Bearer validtoken' },
      user: null,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    const result = jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockDecoded);
  });
});

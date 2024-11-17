import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret',
    });
    jwtAuthGuard = new JwtAuthGuard(jwtService);
  });

  it('should throw UnauthorizedException if Authorization header is missing', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token format is invalid', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'InvalidHeader' },
        }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for an invalid token', () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalidtoken' },
        }),
      }),
    } as any;

    expect(() => jwtAuthGuard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow valid token and attach user to request', () => {
    const mockDecoded = { sub: 1, email: 'test@example.com' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded);

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

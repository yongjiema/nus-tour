import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { TokenBlacklistService } from "./token-blacklist.service";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let _jwtService: JwtService;
  let _configService: ConfigService;
  let _tokenBlacklistService: TokenBlacklistService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("test-secret"),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    _jwtService = module.get<JwtService>(JwtService);
    _configService = module.get<ConfigService>(ConfigService);
    _tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    const createMockContext = (): ExecutionContext =>
      ({
        switchToHttp: () => ({
          getRequest: () =>
            ({
              headers: {
                authorization: "Bearer valid-token",
              },
            }) as { headers: { authorization: string } },
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(() => jest.fn()),
        getClass: jest.fn(
          () =>
            function Dummy() {
              /* noop */
            },
        ),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      }) as unknown as ExecutionContext;

    it("should return true for valid token", () => {
      const mockContext = createMockContext();
      const mockPayload = { sub: "1", email: "test@example.com", username: "testuser", role: "USER" };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(false);
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it("should throw UnauthorizedException for blacklisted token", () => {
      const mockContext = createMockContext();
      const mockPayload = { sub: "1", email: "test@example.com", username: "testuser", role: "USER" };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(true);
      mockReflector.getAllAndOverride.mockReturnValue(false);

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it("should allow public routes", () => {
      const mockContext = createMockContext();
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});

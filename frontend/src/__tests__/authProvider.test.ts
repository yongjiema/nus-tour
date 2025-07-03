import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authProvider } from "../authProvider";
import { UserRole } from "../types/auth.types";

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("../axiosConfig", () => ({
  default: {
    post: mockPost,
    get: mockGet,
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("successfully logs in with valid credentials", async () => {
      const mockResponse = {
        data: {
          access_token: "test-token",
          refresh_token: "test-refresh-token",
          user: {
            id: "user-123",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            roles: [UserRole.USER],
          },
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await authProvider.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        success: true,
        redirectTo: "/u",
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("access_token", "test-token");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({ ...mockResponse.data.user, roles: ["USER"] }),
      );
    });

    it("handles login failure with invalid credentials", async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: "Invalid credentials" },
        },
      };

      mockPost.mockRejectedValue(errorResponse);

      const result = await authProvider.login({
        email: "test@example.com",
        password: "wrong-password",
      });

      expect(result).toEqual({
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid credentials",
        },
      });
    });

    it("handles network errors during login", async () => {
      const networkError = new Error("Network Error");
      mockPost.mockRejectedValue(networkError);

      const result = await authProvider.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      });
    });
  });

  describe("logout", () => {
    it("successfully logs out and clears storage", async () => {
      mockPost.mockResolvedValue({ data: {} });

      const result = await authProvider.logout();

      expect(result).toEqual({
        success: true,
        redirectTo: "/login",
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("access_token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("logs out even if API call fails", async () => {
      mockPost.mockRejectedValue(new Error("API Error"));

      const result = await authProvider.logout();

      expect(result).toEqual({
        success: true,
        redirectTo: "/login",
      });

      // Should still clear storage even if API call fails
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("access_token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("check", () => {
    it("returns authenticated when token exists", async () => {
      // Mock window.location.pathname
      Object.defineProperty(window, "location", {
        value: { pathname: "/u" },
        writable: true,
      });

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "access_token") return "valid-token";
        if (key === "user") return JSON.stringify({ id: "user-123", roles: ["USER"] });
        return null;
      });

      // Mock backend profile call to return a valid user
      mockGet.mockResolvedValue({ data: { id: "user-123", roles: ["USER"] } });

      const result = await authProvider.check();

      expect(result).toEqual({
        authenticated: true,
        roles: ["USER"],
        id: "user-123",
      });
    });

    it("returns unauthenticated when no token exists", async () => {
      // Mock window.location.pathname
      Object.defineProperty(window, "location", {
        value: { pathname: "/u" },
        writable: true,
      });

      mockLocalStorage.getItem.mockImplementation(() => null);

      const result = await authProvider.check();

      expect(result).toEqual({
        authenticated: false,
        redirectTo: "/login",
        roles: [],
      });
    });
  });

  describe("getIdentity", () => {
    it("returns user identity when user data exists", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        roles: [UserRole.USER],
      };

      mockGet.mockResolvedValue({ data: mockUser });

      const result = await authProvider.getIdentity();

      expect(result).toEqual(mockUser);
    });

    it("returns null when no user data exists", async () => {
      mockGet.mockRejectedValue(new Error("Unauthorized"));

      const result = await authProvider.getIdentity();

      expect(result).toBeNull();
    });

    it("handles API errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Network Error"));

      const result = await authProvider.getIdentity();

      expect(result).toBeNull();
    });
  });

  describe("getPermissions", () => {
    it("returns user role when user data exists", async () => {
      const mockResponse = {
        data: {
          roles: [UserRole.ADMIN],
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await authProvider.getPermissions();

      expect(result).toBe("ADMIN");
    });

    it("returns null when no user data exists", async () => {
      mockGet.mockRejectedValue(new Error("Unauthorized"));

      const result = await authProvider.getPermissions();

      expect(result).toBeNull();
    });
  });
});

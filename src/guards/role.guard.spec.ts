import { RolesGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Role } from 'src/users/entities/user.entity';

const mockReflector = { getAllAndOverride: jest.fn() };

const mockContext = (user: any, roles: Role[] | undefined) => {
  mockReflector.getAllAndOverride.mockReturnValue(roles);
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as any);
    jest.clearAllMocks();
  });

  it('doit être défini', () => {
    expect(guard).toBeDefined();
  });

  // ─── Pas de @Roles() → accès libre ───────────────────────────────────────────

  it('doit retourner true si aucun rôle requis (pas de @Roles)', () => {
    const ctx = mockContext({ role: Role.STUDENT }, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('doit retourner true si tableau de rôles vide', () => {
    const ctx = mockContext({ role: Role.STUDENT }, []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  // ─── Rôle correct → accès autorisé ───────────────────────────────────────────

  it('doit retourner true si le rôle de l\'utilisateur correspond', () => {
    const ctx = mockContext({ role: Role.ADMIN }, [Role.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('doit retourner true si le rôle est dans une liste de rôles autorisés', () => {
    const ctx = mockContext({ role: Role.TEACHER }, [Role.ADMIN, Role.TEACHER]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  // ─── Mauvais rôle → ForbiddenException ───────────────────────────────────────

  it('doit lever ForbiddenException si le rôle ne correspond pas', () => {
    const ctx = mockContext({ role: Role.STUDENT }, [Role.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('doit lever ForbiddenException avec un message précis', () => {
    const ctx = mockContext({ role: Role.PARENT }, [Role.ADMIN, Role.TEACHER]);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Accès refusé. Rôle requis : ADMIN ou TEACHER. Votre rôle : PARENT',
    );
  });

  // ─── Pas d'utilisateur → UnauthorizedException ───────────────────────────────

  it('doit lever UnauthorizedException si req.user est undefined', () => {
    const ctx = mockContext(undefined, [Role.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
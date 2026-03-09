import { Roles, ROLES_KEY } from './role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { Reflector } from '@nestjs/core';

describe('Roles Decorator', () => {
  it('doit définir les métadonnées avec les rôles fournis', () => {
    // Crée une classe de test avec le décorateur appliqué
    @Roles(Role.ADMIN, Role.TEACHER)
    class TestController {}

    const reflector = new Reflector();
    const roles = reflector.get<Role[]>(ROLES_KEY, TestController);

    expect(roles).toEqual([Role.ADMIN, Role.TEACHER]);
  });

  it('doit fonctionner avec un seul rôle', () => {
    @Roles(Role.STUDENT)
    class TestController {}

    const reflector = new Reflector();
    const roles = reflector.get<Role[]>(ROLES_KEY, TestController);

    expect(roles).toEqual([Role.STUDENT]);
  });
});
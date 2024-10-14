import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/role.enum';
import { ROLES_KEY, Roles } from '../../decorators/roles.decorator';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockExecutionContext = (
      roles: Role[] | undefined,
      user: any,
    ): ExecutionContext => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
        getHandler: () => null,
        getClass: () => null,
        getArgs: () => [],
        getArgByIndex: () => null,
        switchToRpc: () => null,
        switchToWs: () => null,
        getType: () => 'http',
      } as any;
    };

    it('should allow access if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = mockExecutionContext(undefined, { role: Role.USER });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should allow access if user has one of the required roles', () => {
      const requiredRoles = [Role.ADMIN, Role.USER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: Role.ADMIN });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should deny access if user does not have any of the required roles', () => {
      const requiredRoles = [Role.ADMIN];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: Role.USER });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should deny access if user role is undefined', () => {
      const requiredRoles = [Role.ADMIN];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: undefined });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });


    it('should allow access if user has required role and multiple roles are specified', () => {
      const requiredRoles = [Role.ADMIN, Role.USER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: Role.USER });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should deny access if requiredRoles array is empty', () => {
      const requiredRoles: Role[] = [];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: Role.ADMIN });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should allow access if user has required role and roles are case-sensitive', () => {
      const requiredRoles = [Role.ADMIN];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: 'admin' }); // lowercase 'admin'

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false); // Assuming roles are case-sensitive
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should handle roles not being part of the Role enum', () => {
      const requiredRoles = ['SUPERADMIN' as Role];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      const context = mockExecutionContext(requiredRoles, { role: Role.ADMIN });

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});

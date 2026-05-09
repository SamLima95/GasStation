import type { IUserRepository } from "../ports/user-repository.port";

const FALLBACK_PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  admin: [
    "users:create",
    "users:read:any",
    "users:update:any",
    "users:deactivate:any",
    "unidades:create",
    "unidades:update:config",
    "unidades:link-user",
  ],
};

export class ListRolePermissionsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(role: string): Promise<string[]> {
    const permissions = await this.userRepository.listPermissionsByRole(role);
    if (permissions.length > 0) {
      return permissions;
    }
    return FALLBACK_PERMISSIONS_BY_ROLE[role] ?? [];
  }
}

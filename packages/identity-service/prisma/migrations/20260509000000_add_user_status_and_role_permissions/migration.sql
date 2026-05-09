ALTER TABLE "users" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_permissions_role_permission_key" ON "role_permissions"("role", "permission");

INSERT INTO "role_permissions" ("id", "role", "permission", "created_at") VALUES
  ('role-perm-admin-users-create', 'admin', 'users:create', CURRENT_TIMESTAMP),
  ('role-perm-admin-users-read-any', 'admin', 'users:read:any', CURRENT_TIMESTAMP),
  ('role-perm-admin-users-update-any', 'admin', 'users:update:any', CURRENT_TIMESTAMP),
  ('role-perm-admin-users-deactivate-any', 'admin', 'users:deactivate:any', CURRENT_TIMESTAMP),
  ('role-perm-admin-unidades-create', 'admin', 'unidades:create', CURRENT_TIMESTAMP),
  ('role-perm-admin-unidades-update-config', 'admin', 'unidades:update:config', CURRENT_TIMESTAMP),
  ('role-perm-admin-unidades-link-user', 'admin', 'unidades:link-user', CURRENT_TIMESTAMP);

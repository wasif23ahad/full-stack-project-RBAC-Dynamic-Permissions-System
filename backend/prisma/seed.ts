import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] ?? '' });
const prisma = new PrismaClient({ adapter });

const ROLES = ['ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER'] as const;

const PERMISSIONS: Array<{ atom: string; label: string; module: string }> = [
  { atom: 'dashboard.view', label: 'View Dashboard', module: 'Dashboard' },
  { atom: 'users.view', label: 'View Users', module: 'Users' },
  { atom: 'users.manage', label: 'Manage Users', module: 'Users' },
  { atom: 'leads.view', label: 'View Leads', module: 'Leads' },
  { atom: 'leads.manage', label: 'Manage Leads', module: 'Leads' },
  { atom: 'tasks.view', label: 'View Tasks', module: 'Tasks' },
  { atom: 'tasks.manage', label: 'Manage Tasks', module: 'Tasks' },
  { atom: 'reports.view', label: 'View Reports', module: 'Reports' },
  { atom: 'audit.view', label: 'View Audit Log', module: 'Audit Log' },
  { atom: 'customer_portal.view', label: 'View Customer Portal', module: 'Customer Portal' },
  { atom: 'settings.view', label: 'View Settings', module: 'Settings' },
  { atom: 'settings.manage', label: 'Manage Settings', module: 'Settings' },
  { atom: 'permissions.manage', label: 'Manage Permissions', module: 'Permissions' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.atom),
  MANAGER: [
    'dashboard.view',
    'users.view',
    'users.manage',
    'leads.view',
    'leads.manage',
    'tasks.view',
    'tasks.manage',
    'reports.view',
    'customer_portal.view',
    'settings.view',
  ],
  AGENT: ['dashboard.view', 'leads.view', 'tasks.view'],
  CUSTOMER: ['customer_portal.view'],
};

async function main() {
  console.log('Seeding roles...');
  const roleRecords: Record<string, { id: string }> = {};
  for (const name of ROLES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleRecords[name] = role;
  }

  console.log('Seeding permissions...');
  const permissionRecords: Record<string, { id: string }> = {};
  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { atom: perm.atom },
      update: { label: perm.label, module: perm.module },
      create: perm,
    });
    permissionRecords[perm.atom] = permission;
  }

  console.log('Assigning role permissions...');
  for (const [roleName, atoms] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleRecords[roleName]?.id;
    if (!roleId) continue;
    for (const atom of atoms) {
      const permissionId = permissionRecords[atom]?.id;
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  console.log('Creating default admin user...');
  const passwordHash = await bcrypt.hash('password', 12);
  const adminRoleId = roleRecords['ADMIN']?.id;
  if (adminRoleId) {
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        roleId: adminRoleId,
        status: 'ACTIVE',
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

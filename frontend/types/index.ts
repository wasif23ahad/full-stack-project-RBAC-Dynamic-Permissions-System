export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  roleId: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
  permissions: string[]; // Resolved permissions array
}

export interface Role {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  atom: string;
  label: string;
  module: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

import UsersClient from '@/components/modules/users/UsersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users Management - RBAC Admin',
};

export default function UsersPage() {
  // Authentication and permission checks ('users.view') are handled via Middleware.
  return <UsersClient />;
}

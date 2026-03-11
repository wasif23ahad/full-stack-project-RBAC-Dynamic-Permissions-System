import { useAuth } from './useAuth';

export function usePermission(requiredAtom: string) {
  const { user, isLoading } = useAuth();

  // If we are still loading, it might be safer to just return false or a loading state,
  // but returning a boolean is the simplest contract.
  if (isLoading || !user) {
    return false;
  }

  // If user has the permission in their resolved permissions array
  return user.permissions?.includes(requiredAtom) ?? false;
}

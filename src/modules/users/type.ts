export type AppUserRole = 'USER' | 'RIDER' | 'ADMIN' | 'SUPPORT';

/** `PUBLIC_USER_SELECT` on the server — the password hash is never included. */
export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
  profilePhotoUrl: string | null;
  roles: AppUserRole[];
  authProvider: 'FIREBASE_GOOGLE' | 'FIREBASE_PHONE' | 'PASSWORD';
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: string;
}

export interface BlockUserVariables {
  id: string;
  isBlocked: boolean;
  reason?: string;
}

/** The two roles an admin can hand out — never USER or RIDER, which come from the app's own sign-up flow. */
export type StaffRole = 'ADMIN' | 'SUPPORT';

export interface CreateStaffVariables {
  email: string;
  password: string;
  name: string;
  role: StaffRole;
}

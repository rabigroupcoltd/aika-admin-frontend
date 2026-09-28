export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photoUrl?: string | null;
  roles: string[];
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResult {
  accessToken: string;
  user: AdminUser;
}

/** `GET /auth/profile` — enough of it for role gating; the rest of the payload goes unused here. */
export interface CurrentAdmin {
  id: string;
  name: string | null;
  email: string | null;
  roles: string[];
}

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

export interface CurrentAdmin {
  id: string;
  name: string | null;
  email: string | null;
  roles: string[];
}

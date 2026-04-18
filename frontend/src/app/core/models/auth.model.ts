export interface SavedAddress {
  name:    string;
  address: string;
  city:    string;
  zip:     string;
  country: string;
}

export interface AuthUser {
  id:           string;
  name:         string;
  lastName:     string;
  dni:          string;
  email:        string;
  role:         'user' | 'admin';
  savedAddress: SavedAddress | null;
}

export interface AuthResponse {
  success: boolean;
  token:   string;
  user:    AuthUser;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}

export interface UpdateProfilePayload {
  name?:         string;
  lastName?:     string;
  dni?:          string;
  savedAddress?: SavedAddress | null;
}

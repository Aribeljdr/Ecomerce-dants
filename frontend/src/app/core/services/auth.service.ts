import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import {
  AuthUser, AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, SavedAddress
} from '../models/auth.model';
import { IdbService } from './idb.service';

interface IdbUser {
  _id: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'admin' | 'user';
  savedAddress: SavedAddress | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private idb    = inject(IdbService);
  private router = inject(Router);

  private _user = signal<AuthUser | null>(this.loadUser());
  readonly user         = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => this._user() !== null);
  readonly isAdmin      = computed(() => this._user()?.role === 'admin');
  readonly savedAddress = computed(() => this._user()?.savedAddress ?? null);

  login(payload: LoginPayload): Observable<AuthResponse> {
    return from((async () => {
      const record = await this.idb.getByIndex<IdbUser>('users', 'email', payload.email);
      if (!record) throw new Error('Credenciales inválidas');

      const hash = await this.hashPassword(payload.password, record.passwordSalt);
      if (hash !== record.passwordHash) throw new Error('Credenciales inválidas');

      const res: AuthResponse = { success: true, token: record._id, user: this.toAuthUser(record) };
      this.setSession(res);
      return res;
    })());
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return from((async () => {
      const existing = await this.idb.getByIndex<IdbUser>('users', 'email', payload.email);
      if (existing) throw new Error('El email ya está registrado');

      const salt = this.generateSalt();
      const hash = await this.hashPassword(payload.password, salt);

      const newUser: IdbUser = {
        _id: crypto.randomUUID(),
        name: payload.name,
        lastName: '',
        dni: '',
        email: payload.email,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'user',
        savedAddress: null,
        createdAt: new Date().toISOString(),
      };
      await this.idb.put('users', newUser);

      const res: AuthResponse = { success: true, token: newUser._id, user: this.toAuthUser(newUser) };
      this.setSession(res);
      return res;
    })());
  }

  updateProfile(payload: UpdateProfilePayload): Observable<{ success: boolean; user: AuthUser }> {
    return from((async () => {
      const current = this._user();
      if (!current) throw new Error('Not logged in');

      const record = await this.idb.getById<IdbUser>('users', current.id);
      if (!record) throw new Error('User not found');

      const updated: IdbUser = {
        ...record,
        name:         payload.name         ?? record.name,
        lastName:     payload.lastName     ?? record.lastName,
        dni:          payload.dni          ?? record.dni,
        savedAddress: payload.savedAddress !== undefined ? (payload.savedAddress ?? null) : record.savedAddress,
      };
      await this.idb.put('users', updated);

      const authUser = this.toAuthUser(updated);
      this._user.set(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    })());
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private toAuthUser(u: IdbUser): AuthUser {
    return {
      id:           u._id,
      name:         u.name,
      lastName:     u.lastName ?? '',
      dni:          u.dni ?? '',
      email:        u.email,
      role:         u.role,
      savedAddress: u.savedAddress,
    };
  }

  private async hashPassword(password: string, saltHex: string): Promise<string> {
    const salt = this.hexToBytes(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return this.bytesToHex(new Uint8Array(bits));
  }

  private generateSalt(): string {
    return this.bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  }

  private hexToBytes(hex: string): Uint8Array {
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return result;
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

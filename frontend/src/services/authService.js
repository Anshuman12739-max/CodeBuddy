import api from './api';
import { supabase, isSupabaseReady } from './supabaseClient';

export const authService = {
  async register(email, password, displayName) {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });
      if (error) throw error;
      if (data.session) {
        localStorage.setItem('codebuddy_token', data.session.access_token);
      }
      return data;
    } else {
      // Local dev simulated registration
      const devUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email,
        displayName: displayName || email.split('@')[0]
      };
      localStorage.setItem('codebuddy_token', 'dev-local-jwt');
      localStorage.setItem('codebuddy_user', JSON.stringify(devUser));
      return { user: devUser, session: { access_token: 'dev-local-jwt' } };
    }
  },

  async login(email, password) {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.session) {
        localStorage.setItem('codebuddy_token', data.session.access_token);
      }
      return data;
    } else {
      // Local dev simulated login
      const devUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email,
        displayName: email.split('@')[0] || 'Student'
      };
      localStorage.setItem('codebuddy_token', 'dev-local-jwt');
      localStorage.setItem('codebuddy_user', JSON.stringify(devUser));
      return { user: devUser, session: { access_token: 'dev-local-jwt' } };
    }
  },

  async logout() {
    if (isSupabaseReady && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('codebuddy_token');
    localStorage.removeItem('codebuddy_user');
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },

  async getProfile() {
    return api.get('/profile');
  },

  async updateProfile(updates) {
    return api.patch('/profile', updates);
  }
};

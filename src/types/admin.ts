
import { User } from "@supabase/supabase-js";

export type UserRole = 'admin' | 'user';

export interface AppSettings {
  maintenance_mode: {
    enabled: boolean;
    message: string;
  };
  features: {
    fake_jobs_enabled: boolean;
    fake_profiles_enabled: boolean;
  };
  app_info: {
    version: string;
    last_updated: string;
  };
}

export interface AdminUser extends User {
  role: UserRole;
}

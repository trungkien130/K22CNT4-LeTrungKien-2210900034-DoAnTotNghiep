import type { User } from "./index";

export interface AuthState {
  user: User | null;
  onLogout: () => void;
}

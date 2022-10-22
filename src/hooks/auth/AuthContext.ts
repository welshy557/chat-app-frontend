import { createContext } from "react";
import { User } from "../../models";

export interface AuthContextTypes {
  storedToken: string | null;
  setStoredToken: (token: string | null) => void;
  storedUser: User | null;
  setStoredUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextTypes>(
  {} as AuthContextTypes
);

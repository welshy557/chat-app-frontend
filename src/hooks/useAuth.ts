import { useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../models";
import useApi from "./useApi";

function useAuth() {
  const [storedToken, setToken] = useState(() => {
    try {
      const token = window.localStorage.getItem("token");
      return token;
    } catch (error) {
      console.log(error);
      return null;
    }
  });

  const setStoredToken = (token: string | null) => {
    try {
      setToken(token);
      if (typeof window !== "undefined") {
        if (token !== null) {
          window.localStorage.setItem("token", `bearer ${token}`);
        } else {
          window.localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.log(error);
      setToken(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("token");
      }
    }
  };

  const [storedUser, setUser] = useState(() => {
    try {
      const IUser = window.localStorage.getItem("user");
      const user = IUser ? (JSON.parse(IUser) as User) : null;
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  });

  const setStoredUser = (user: User | null) => {
    try {
      setUser(user);
      if (typeof window !== "undefined") {
        if (user !== null) {
          window.localStorage.setItem("user", JSON.stringify(user));
        } else {
          window.localStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.log(error);
      setToken(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user");
      }
    }
  };

  return { storedToken, setStoredToken, storedUser, setStoredUser };
}

export default useAuth;

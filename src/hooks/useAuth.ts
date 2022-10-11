import { useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import useApi from "./useApi";

function useAuth() {
  const [storedToken, setToken] = useState(() => {
    try {
      const token = window.localStorage.getItem("token");
      return token ? token : null;
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

  return { storedToken, setStoredToken };
}
//
export default useAuth;

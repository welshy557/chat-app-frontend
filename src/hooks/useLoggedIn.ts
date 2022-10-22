import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import useApi from "./useApi";
import useAuth from "./auth/useAuth";

export default function useLoggedIn() {
  const navigate = useNavigate();
  const { storedToken } = useAuth();
  const api = useApi();

  const authticated = useCallback(async () => {
    const response = await api.get("validate");
    return response.status === 200;
  }, [storedToken]);

  useEffect(() => {
    authticated()
      .then((authticated) => {
        if (authticated) {
          navigate("/home");
        } else {
          navigate("/");
        }
      })
      .catch(() => navigate("/"));
  });
}

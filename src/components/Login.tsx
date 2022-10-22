import "../index.css";
import useAuth from "../hooks/auth/useAuth";
import useApi from "../hooks/useApi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useMutation } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import { useContext, useRef } from "react";
import { User } from "../models";
import { AuthContext } from "../hooks/auth/AuthContext";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export default function () {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setStoredToken, setStoredUser } = useContext(AuthContext);
  const api = useApi();

  if (location.state?.msg) {
    toast.success(location.state.msg);
    location.state.msg = undefined;
  }

  const { mutateAsync: handleLogin, isLoading } = useMutation(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!emailRef?.current?.value || !passwordRef?.current?.value) {
        return;
      }
      const data: LoginData = {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      };
      return await api.post<LoginData, LoginResponse>("login", data);
    },
    {
      onSuccess: (res) => {
        if (!res) return;
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        navigate("/home");
      },
      onError: (err: Error) => {
        console.error(err);
        if (err.message === "Request failed with status code 403") {
          toast.error("Incorrect username/password");
        }
      },
    }
  );
  return (
    <>
      <Toaster />
      <Loader isLoading={isLoading} />
      <div className="loginRegisterContainer">
        <form onSubmit={handleLogin}>
          <div className="loginRegisterContent">
            <div className="loginRegisterTitle">Sign In</div>
            <label className="loginRegisterLabel" htmlFor="email">
              Email
            </label>
            <input
              ref={emailRef}
              className="emailInput"
              type="email"
              name="email"
              title="Email"
              required
            />
            <label className="loginRegisterLabel" htmlFor="password">
              Password
            </label>
            <input
              ref={passwordRef}
              className="passwordInput"
              type="password"
              name="password"
              title="Password"
              required
            />
            <button className="loginButton" type="submit">
              Log In{" "}
            </button>
          </div>
          <div style={{ marginLeft: 10, marginTop: 10 }}>
            Not Registered?{" "}
            <Link style={{ color: "white" }} to={{ pathname: "/register" }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

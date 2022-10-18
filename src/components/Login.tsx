import "../index.css";
import useAuth from "../hooks/useAuth";
import useApi from "../hooks/useApi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useMutation } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import { useRef } from "react";

export default function () {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setStoredToken, setStoredUser } = useAuth();
  const api = useApi();

  if (location.state?.msg) {
    toast.success(location.state.msg);
    location.state.msg = undefined;
  }

  const { mutateAsync: handleLogin, isLoading } = useMutation(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = {
        email: emailRef?.current?.value,
        password: passwordRef?.current?.value,
      };
      return await api.post("login", data);
    },
    {
      onSuccess: (res) => {
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

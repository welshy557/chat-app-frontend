import { useRef, useState } from "react";
import "../index.css";
import useApi from "../hooks/useApi";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { useMutation, useQuery } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import { User } from "../models";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function Register() {
  const api = useApi();
  const navigate = useNavigate();

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const passwordsMatch =
    confirmPassword.length > 0 ? password === confirmPassword : true;
  const passwordHasUpper = [...password].some((char) => /^[A-Z]*$/.test(char));
  const passwordHasDigit = [...password].some((char) => /^[0-9]*$/.test(char));

  const validPassword =
    passwordHasUpper && passwordHasDigit && password.length >= 8;

  const errors: String[] = [];
  const { mutateAsync: handleSubmit, isLoading } = useMutation(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validPassword) {
        errors.push("Invalid Password");
      }

      if (userExists) {
        errors.push("User Already Exist");
      }

      if (errors.length > 0) {
        throw new Error("User Errors Occured");
      }

      if (!firstNameRef?.current?.value || !lastNameRef?.current?.value) {
        return;
      }
      const data: RegisterData = {
        firstName: firstNameRef?.current?.value,
        lastName: lastNameRef?.current?.value,
        email: email,
        password: password,
      };

      const result = await api.post("users", data);
      return result;
    },
    {
      onSuccess: (res) => {
        if (!res) return;
        navigate("/", { state: { msg: "Succesfully Created User" } });
      },
      onError: (err) => {
        errors.forEach((userErr) => toast.error(userErr as any));
        console.error(err);
      },
    }
  );

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    ["users"],
    async () => {
      return (await api.get<User[]>("users")).data;
    },
    {
      onError: (err) => console.log(err),
    }
  );

  const userExists =
    email.length > 0 ? users?.some((user) => user.email === email) : false;

  return (
    <>
      <Toaster />
      <Loader isLoading={isLoading || isLoadingUsers} />
      <div className="loginRegisterContainer">
        <form onSubmit={handleSubmit}>
          <div className="loginRegisterContent">
            <div className="loginRegisterTitle">Register</div>
            <label className="loginRegisterLabel" htmlFor="firstName">
              First Name
            </label>
            <input
              ref={firstNameRef}
              className="emailInput"
              type="text"
              name="firstName"
              required
            />
            <label className="loginRegisterLabel" htmlFor="lastName">
              Last Name
            </label>
            <input
              ref={lastNameRef}
              className="emailInput"
              type="text"
              name="lastName"
              required
            />
            <label className="loginRegisterLabel" htmlFor="email">
              Email
            </label>
            <input
              className="emailInput"
              type="email"
              name="email"
              title="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            {userExists && (
              <div
                style={{
                  marginLeft: 50,
                  marginBottom: 5,
                  marginTop: 5,
                  color: "white",
                }}
              >
                Email already registered.{" "}
                <Link style={{ color: "white" }} to={{ pathname: "/" }}>
                  Sign In
                </Link>
              </div>
            )}
            <label className="loginRegisterLabel" htmlFor="password">
              Password
            </label>
            <div>
              <input
                className="passwordInput"
                type="password"
                name="password"
                value={password}
                required
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <FontAwesomeIcon
                  icon={validPassword ? faCircleCheck : faCircleXmark}
                  color={validPassword ? "green" : "red"}
                  style={{ paddingRight: 50, paddingLeft: 10 }}
                />
              )}
            </div>
            {passwordFocused && (
              <div className="passwordRulesContainer">
                <div
                  className="passwordRule"
                  style={{ color: password.length > 8 ? "green" : "red" }}
                >
                  8 Characters Long
                </div>
                <div
                  className="passwordRule"
                  style={{ color: passwordHasDigit ? "green" : "red" }}
                >
                  Contains 1 Digit
                </div>
                <div
                  className="passwordRule"
                  style={{ color: passwordHasUpper ? "green" : "red" }}
                >
                  Contains 1 Capital Letter
                </div>
              </div>
            )}
            <label className="loginRegisterLabel" htmlFor="password">
              Confirm Password
            </label>
            <div className="passwordInputContainer">
              <input
                className="passwordInput"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {password.length > 0 && (
                <FontAwesomeIcon
                  icon={passwordsMatch ? faCircleCheck : faCircleXmark}
                  color={passwordsMatch ? "green" : "red"}
                  style={{ paddingRight: 50, paddingLeft: 10 }}
                />
              )}
            </div>
            {!passwordsMatch && (
              <div style={{ marginLeft: 50, marginBottom: 5, color: "white" }}>
                Passwords must match
              </div>
            )}
            <button className="loginButton" type="submit">
              Sign Up
            </button>
          </div>
          <div style={{ marginLeft: 10, marginTop: 10 }}>
            Already Registered?{" "}
            <Link style={{ color: "white" }} to={{ pathname: "/" }}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

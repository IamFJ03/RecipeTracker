import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Eye, EyeClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function Authentication() {

  const [login, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cnfPassword, setCnfPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [passErrMsg, setPassErrMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { loggedIn } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSignUp = async () => {

    if (!username || !email || password.length < 8) {
      setErrMsg("All fields required. Password must be at least 8 characters.");
      return;
    }

    if (!validateEmail(email)) {
      setErrMsg("Invalid email address");
      return;
    }

    if (password !== cnfPassword) {
      setPassErrMsg("Passwords must match!");
      return;
    }

    try {
      const response = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/authentication/signup",
        { username, email, password }
      );

      if (response.data.message === "User Created Succesfully") {
        setLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
        setCnfPassword("");
      }

    } catch (e) {
      console.log(e);
    }
  };

  const handleLogin = async () => {

    if (!username || !email || password.length < 8) {
      setErrMsg("All fields required. Password must be at least 8 characters.");
      return;
    }

    if (!validateEmail(email)) {
      setErrMsg("Invalid email address");
      return;
    }

    try {
      const res = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/authentication/login",
        { username, email, password },
        { withCredentials: true }
      );

      if (res.data.message === "Authentication Succesfull") {
        loggedIn(res.data.USER);
        navigate('/');
      }

    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (errMsg || passErrMsg) {
      const timer = setTimeout(() => {
        setErrMsg("");
        setPassErrMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errMsg, passErrMsg]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white shadow-xl w-full max-w-md rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-center mb-2">
          {login ? "Welcome Back " : "Create Account"}
        </h2>

        <p className="text-gray-500 text-center mb-6 text-sm">
          {login
            ? "Continue your culinary journey"
            : "Join the culinary journey"}
        </p>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
          />
          <User className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="relative mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
          />
          <Mail className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>

        {errMsg && <p className="text-red-500 text-sm mb-3">{errMsg}</p>}

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
          />
          {showPass ? (
            <EyeClosed
              onClick={() => setShowPass(false)}
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              size={18}
            />
          ) : (
            <Eye
              onClick={() => setShowPass(true)}
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              size={18}
            />
          )}
        </div>

        {!login && (
          <div className="relative mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              value={cnfPassword}
              onChange={(e) => setCnfPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
        )}

        {passErrMsg && <p className="text-red-500 text-sm mb-3">{passErrMsg}</p>}

        <button
          onClick={login ? handleLogin : handleSignUp}
          className="w-full bg-blue-300 py-2 rounded-lg hover:scale-105 transition"
        >
          {login ? "Log In" : "Sign Up"}
        </button>

        <p className="text-center text-sm mt-5">
          {login ? "Don't have an account?" : "Already have an account?"}
          <button
            className="ml-2 text-blue-500 font-medium"
            onClick={() => setLogin(!login)}
          >
            {login ? "Sign Up" : "Log In"}
          </button>
        </p>

      </div>

    </div>
  );
}

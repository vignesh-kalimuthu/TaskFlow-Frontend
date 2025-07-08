import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { BUTTON_CLASSES, INPUTWRAPPER } from "../assets/dummy";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const INITIAL_FORM = {
  email: "",
  password: "",
};
const Login = ({ onSubmit, onSwitchMode }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const navigate = useNavigate();
  const url = "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      async () => {
        try {
          const { data } = await axios.get(`${url}/v1/auth/current`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            toast.success("Welcome back!");
            navigate("/");
          } else {
            localStorage.clear();
          }
        } catch (error) {
          localStorage.clear();
          console.error("Error fetching current user:", error);
        }
      };
    }
  }, [navigate, onSubmit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rememberMe) {
      toast.error('You must enable "Remember Me" to login');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${url}/v1/auth/login`, formData);
      if (!data.token) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success("Login successful!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode();
  };

  const fields = [
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      icon: Mail,
    },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  return (
    <div className="max-w-md bg-white w-full shadow-lg border-purple-100 rounded-xl p-8">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="mb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sign in to continue to TaskFlow
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
          <div key={name} className={INPUTWRAPPER}>
            {Icon && <Icon className="w-5 h-5 text-purple-500 mr-2" />}
            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              className="w-full focus:outline-none text-sm text-gray-700"
              required
            />
            {isPassword && (
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-purple-500 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remerberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded"
            required
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 ">
            Remember Me
          </label>
        </div>
        <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
          {loading ? (
            "Logging In..."
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Login
            </>
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?
        <button
          onClick={handleSwitchMode}
          className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, Smartphone, CheckCircle, Circle, Eye, EyeOff } from "lucide-react";

const passwordChecks = [
  { name: "min8", test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { name: "upper", test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { name: "lower", test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { name: "number", test: (v: string) => /\d/.test(v), label: "One number" }
];

const isValidPhone = (val: string) => /^\d{10}$/.test(val);
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "";

  const passwordValidations = passwordChecks.map((item) => ({
    ...item,
    valid: item.test(formData.password)
  }));

  const passwordsMatch =
    !isLogin && formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : true;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset inactivity timer on user events
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (user) {
        logout();
        alert("Logged out");
        navigate("/login"); // Ensure user is navigated to login after logout
      }
    }, AUTO_LOGOUT_TIME);
  };

  // Setup inactivity listeners and timer
  useEffect(() => {
    if (!user) return; // Only track inactivity if logged in

    const events = ["mousemove", "mousedown", "click", "scroll", "keypress", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout, navigate]);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from || "/");
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        let input = formData.emailOrPhone.trim();
        let email = "";
        let phone = "";
        if (isValidPhone(input)) {
          phone = input;
        } else if (isEmail(input)) {
          email = input;
        } else {
          setError("Please enter a valid email or 10-digit phone number");
          setLoading(false);
          return;
        }
        const success = await login(email || phone, formData.password);
        if (success) {
          navigate(from || "/", { replace: true });
        } else {
          setError("Invalid credentials");
        }
      } else {
        if (!isValidPhone(formData.phone)) {
          setError("Phone number must be exactly 10 digits");
          setLoading(false);
          return;
        }
        if (passwordValidations.some((c) => !c.valid) || !passwordsMatch) {
          setError(
            !passwordsMatch
              ? "Passwords do not match"
              : "Password does not meet all conditions"
          );
          setLoading(false);
          return;
        }
        const success = await register(
          formData.name,
          formData.email,
          formData.password
        );
        if (success) {
          navigate(from || "/", { replace: true });
        } else {
          setError("Registration failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="#" className="flex justify-center items-center space-x-2 mb-4">
          {/* <span className="text-2xl font-bold text-gray-900">GHAR SANSAR</span> */}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10"
        >
          <div className="flex justify-center mb-2">
            <img
              src="/ghar sansar logo.svg"
              alt="Ghar Sansar Logo"
              className="w-40 h-45"
            />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <p className="mt-2 text-gray-600">
              {isLogin ? "Welcome back!" : "Join our community today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              <>
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                    Email or Phone
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="emailOrPhone"
                      name="emailOrPhone"
                      type="text"
                      required
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={10}
                      minLength={10}
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your 10-digit phone"
                    />
                  </div>
                  {formData.phone && !isValidPhone(formData.phone) && (
                    <span className="text-xs text-red-500">Phone number must be exactly 10 digits.</span>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <ul className="mt-2 space-y-1 text-xs">
                  {passwordValidations.map((c) => (
                    <li key={c.name} className="flex items-center">
                      {c.valid ? (
                        <CheckCircle className="text-green-600 w-4 h-4 mr-1" />
                      ) : (
                        <Circle className="text-gray-300 w-4 h-4 mr-1" />
                      )}
                      <span className={c.valid ? "text-green-700" : "text-gray-500"}>
                        {c.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      formData.confirmPassword && (passwordsMatch ? "border-green-400" : "border-red-400")
                    }`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <span className="text-xs text-red-500">Passwords do not match.</span>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {isLogin
                  ? ""
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

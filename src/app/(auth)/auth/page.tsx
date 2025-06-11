"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every((digit) => digit !== "") && !verifying) {
      handleVerifyCode(newOtp.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Extract only numeric characters
    const numericData = pastedData.replace(/\D/g, "");

    if (numericData.length === 0) return;

    const newOtp = [...otp];

    // Fill the inputs with the pasted digits
    for (let i = 0; i < Math.min(numericData.length, 6); i++) {
      newOtp[i] = numericData[i];
    }

    setOtp(newOtp);

    // Focus the next empty field or the last field
    const nextIndex = Math.min(numericData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-verify if all 6 digits are filled
    if (numericData.length >= 6 && !verifying) {
      handleVerifyCode(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) return;

    setVerifying(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    if (error) {
      setError(error.message);
      setOtp(["", "", "", "", "", ""]); // Clear OTP on error
      inputRefs.current[0]?.focus();
    } else {
      router.push("/projects");
      router.refresh();
    }
    setVerifying(false);
  };

  const handleBackToEmail = () => {
    setSent(false);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
  };

  // Focus first input when OTP view loads
  useEffect(() => {
    if (sent) {
      inputRefs.current[0]?.focus();
    }
  }, [sent]);

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-kafuffle-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-kafuffle-primary" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Check your email
              </h2>
              <p className="text-neutral-600 mb-6">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg text-kafuffle-primary font-semibold border-2 border-neutral-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={verifying}
                  />
                ))}
              </div>

              {verifying && (
                <div className="text-center">
                  <div className="inline-flex items-center text-kafuffle-primary">
                    <div className="w-4 h-4 border-2 border-kafuffle-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBackToEmail}
                  className="flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>

                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-kafuffle-primary hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome to Kafuffle
            </h1>
            <p className="text-neutral-600">Organize your beautiful chaos</p>
          </div>

          <form onSubmit={handleSendCode} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-600"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-kafuffle-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Magic Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            We'll send you a 6-digit code - no password needed!
          </div>
        </div>
      </div>
    </div>
  );
}

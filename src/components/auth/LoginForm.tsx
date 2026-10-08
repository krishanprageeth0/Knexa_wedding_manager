"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPasswordLogin, setIsPasswordLogin] = useState(true); // Default to password login to avoid rate limits

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setTimeout(() => { window.location.href = "/dashboard"; }, 800);
      return;
    }

    if (isPasswordLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email for the magic link!");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 glass rounded-3xl shadow-luxury border border-white/50 relative z-10">
      <h2 className="text-3xl font-serif text-deep-charcoal text-center mb-2">Welcome Back</h2>
      <p className="text-sage-green text-center mb-8 font-medium">Access your wedding workspace</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-deep-charcoal/80 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:border-rose-gold/50 focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>
        
        {isPasswordLogin && (
          <div>
            <label className="block text-sm font-medium text-deep-charcoal/80 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:border-rose-gold/50 focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-deep-charcoal text-white rounded-xl font-medium shadow-md hover:bg-deep-charcoal/90 hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isLoading ? "Please wait..." : (isPasswordLogin ? "Sign In" : "Send Magic Link")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsPasswordLogin(!isPasswordLogin)}
          className="text-sm text-sage-green hover:text-deep-charcoal transition-colors font-medium"
        >
          {isPasswordLogin ? "Login with Magic Link instead" : "Login with Password instead"}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-deep-charcoal bg-rose-gold/10 py-2 rounded-lg">
          {message}
        </p>
      )}
    </div>
  );
}

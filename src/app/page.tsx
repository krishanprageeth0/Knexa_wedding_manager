"use client";

import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-ivory via-white to-rose-gold/10 p-4 min-h-screen">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-rose-gold/20 rounded-full blur-3xl mix-blend-multiply opacity-70 pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sage-green/20 rounded-full blur-3xl mix-blend-multiply opacity-60 pointer-events-none" 
      />

      {/* Floating Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [-20, -40, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          className="absolute w-2 h-2 rounded-full bg-rose-gold/40"
          style={{ top: `${20 + i * 10}%`, left: `${15 + i * 15}%` }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center max-w-2xl mx-auto mb-10 mt-10"
      >
        <p className="font-cursive text-4xl text-rose-gold mb-2">Welcome to</p>
        <h1 className="text-6xl md:text-8xl font-serif text-deep-charcoal mb-6 tracking-tight">
          Knexa Wedding Manager
        </h1>
        <p className="text-lg md:text-xl text-sage-green font-medium tracking-widest uppercase">
          Your journey to forever, beautifully managed.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        <LoginForm />
      </motion.div>
      <div className="mt-auto w-full">
        <Footer />
      </div>
    </main>
  );
}

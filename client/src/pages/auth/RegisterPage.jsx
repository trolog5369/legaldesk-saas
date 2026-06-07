import React from 'react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-sm border border-[#E2E8F0] w-full max-w-[400px]"
      >
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6 text-center">Register</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Full Name</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Email</label>
            <input type="email" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Password</label>
            <input type="password" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]" />
          </div>
          <button className="w-full h-10 bg-[#1D4ED8] text-white rounded-lg font-medium hover:bg-[#1E40AF] transition-colors mt-2">
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

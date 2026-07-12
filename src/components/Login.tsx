import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, Users, Briefcase, Mail, Lock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login, signup, departments, employees } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123'); // Preset for mock ease
  
  // Signup States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState(departments[0]?.id || '');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail) {
      setError('Please enter your email address.');
      return;
    }
    const success = login(loginEmail);
    if (!success) {
      setError('Invalid email address or inactive account.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName || !signupEmail || !signupDept) {
      setError('Please fill out all required fields.');
      return;
    }
    const success = signup(signupName, signupEmail, signupDept);
    if (success) {
      setSuccess('Account created successfully! Welcome to AssetFlow.');
    } else {
      setError('Email address is already registered.');
    }
  };

  const triggerQuickLogin = (email: string) => {
    login(email);
  };

  const testAccounts = [
    { name: 'Alex Rivera', role: 'System Admin', email: 'admin@assetflow.com', desc: 'Can manage organization, employees, and full audit logs.', icon: ShieldCheck, color: 'text-[#141414] bg-white border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]' },
    { name: 'Sarah Connor', role: 'Asset Manager', email: 'manager@assetflow.com', desc: 'Can register, allocate, return assets, and approve maintenance.', icon: Briefcase, color: 'text-[#141414] bg-white border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]' },
    { name: 'David Vance', role: 'Department Head', email: 'head@assetflow.com', desc: 'Can approve transfers & book shared rooms on behalf of department.', icon: Users, color: 'text-[#141414] bg-white border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]' },
    { name: 'Sam Carter', role: 'Employee', email: 'employee@assetflow.com', desc: 'Can view allocated assets, make bookings, and request repairs.', icon: User, color: 'text-[#141414] bg-white border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]' },
  ];

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-2.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <span className="text-4xl font-extrabold tracking-tighter uppercase italic text-[#141414]" style={{ fontFamily: 'Georgia, serif' }}>
            AssetFlow
          </span>
        </div>
        <h2 className="text-center text-xs font-bold tracking-widest uppercase text-[#141414]/70 font-mono">
          Enterprise Asset & Resource ERP
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border-2 border-[#141414] sm:px-10">
          
          {/* Tabs */}
          <div className="flex border border-[#141414] mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 text-center py-3 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                isLogin ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white text-[#141414] hover:bg-[#E4E3E0]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 text-center py-3 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                !isLogin ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white text-[#141414] hover:bg-[#E4E3E0]'
              }`}
            >
              Request Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-500 p-3 text-xs font-mono text-red-950 font-bold">
              [ERROR]: {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-100 border border-emerald-600 p-3 text-xs font-mono text-emerald-950 font-bold">
              [SUCCESS]: {success}
            </div>
          )}

          {isLogin ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#141414] mb-1 font-mono">
                  Employee Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#141414]/70" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@organization.com"
                    className="block w-full pl-10 pr-3 py-2 border border-[#141414] text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#141414] mb-1 font-mono">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Mode: Password is hardcoded for sandbox test access. Please click any quick role button below to access.')}
                    className="text-[10px] text-[#141414] underline font-mono"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#141414]/70" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    readOnly
                    className="block w-full pl-10 pr-3 py-2 border border-[#141414] bg-[#E4E3E0]/35 text-[#141414]/60 text-sm font-mono cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#141414]/60 font-mono">[DEMO]: Password bypass enabled for immediate inspection.</p>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-[#141414] text-xs font-bold uppercase tracking-widest text-[#E4E3E0] bg-[#141414] hover:bg-white hover:text-[#141414] transition-colors cursor-pointer font-mono"
                >
                  Access System
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              <div className="bg-[#E4E3E0] p-3 text-[10px] text-[#141414] border border-[#141414] font-mono leading-relaxed">
                <span className="font-bold uppercase block mb-1">[ROLE SECURITY MANIFEST]:</span>
                Registering via registration forms grants temporary <strong>Employee</strong> clearance. System Administrators can elevate profiles to Department Head or Asset Manager in the Organization Setup.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#141414] mb-1 font-mono">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-[#141414]/70" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full pl-10 pr-3 py-2 border border-[#141414] text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#141414] mb-1 font-mono">
                  Organizational Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#141414]/70" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jane@organization.com"
                    className="block w-full pl-10 pr-3 py-2 border border-[#141414] text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#141414] mb-1 font-mono">
                  Assigned Department
                </label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="block w-full px-3 py-2 border border-[#141414] text-sm font-mono"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-[#141414] text-xs font-bold uppercase tracking-widest text-[#E4E3E0] bg-[#141414] hover:bg-white hover:text-[#141414] transition-colors cursor-pointer font-mono"
                >
                  Register Account & Login
                </button>
              </div>
            </form>
          )}

          {/* Quick Login Bar */}
          <div className="mt-8 pt-6 border-t border-[#141414]">
            <h3 className="text-center text-[10px] font-bold text-[#141414] uppercase tracking-widest mb-4 font-mono">
              [SANDBOX DEMO GATEWAY — CHOOSE INSTANT ROLE]
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {testAccounts.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => triggerQuickLogin(acc.email)}
                    className="flex flex-col items-start p-3 text-left border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors duration-150 cursor-pointer font-mono group"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="h-4 w-4 shrink-0 text-[#141414] group-hover:text-[#E4E3E0]" />
                      <span className="font-bold text-xs text-[#141414] group-hover:text-[#E4E3E0]">{acc.name}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#141414]/60 group-hover:text-[#E4E3E0]/75 uppercase tracking-wider mb-1">{acc.role}</span>
                    <span className="text-[9px] text-[#141414]/50 group-hover:text-[#E4E3E0]/50 truncate w-full">{acc.email}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

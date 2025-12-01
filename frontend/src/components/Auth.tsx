import React, { useState } from 'react';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface AuthProps {
  onLogin: (token: string) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api(`/auth/${view}`, 'POST', form);
      onLogin(res.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GradeTracker</h1>
          <p className="text-slate-500">{view === 'login' ? 'Welcome Back' : 'Create Account'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4"/> {error}
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Username</label>
            <input 
              required 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Password</label>
            <input 
              required 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
            />
          </div>
          
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex justify-center transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : (view === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        
        <button 
          onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} 
          className="w-full mt-4 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          {view === 'login' ? "No account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}
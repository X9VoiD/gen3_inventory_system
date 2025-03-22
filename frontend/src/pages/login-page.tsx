import { useState } from 'react';
import { useAuth } from '../providers/auth-provider';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ashley-background">
      <div className="relative w-full max-w-lg p-6 space-y-6 bg-white rounded-t-3xl shadow-lg border-ashley-gray border-6">
        <div className="flex items-center justify-center ">
          <div className="bg-ashley-gray mr-2 p-2">
            <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold text-gray-700">INVENTORY MANAGER</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full py-3 pl-10 pr-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete='email'
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="block w-full py-3 pl-10 pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 py-2.5 text-sm font-medium text-gray-900 bg-ashley-accent border-3 border-ashley-gray rounded-md hover:bg-ashley-accent-4 focus:outline-none focus:ring-3 focus:ring-offset-1 focus:ring-ashley-accent-8"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

// src/app/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import DarkModeToggle from '../components/darkModeToggle';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [club, setClub] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMessage('Error fetching user');
          setMessageType('error');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_host')
          .eq('id', user.id)
          .single();
        if (profileError) {
          setMessage('Error fetching user profile');
          setMessageType('error');
        } else {
          setMessage(`Hello ${profile.is_host ? 'skipper' : 'football fan'}`);
          setMessageType('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    } else {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: user.id, username, club, is_host: false });
        if (profileError) {
          setMessage('Error creating user profile');
          setMessageType('error');
        } else {
          setMessage('Sign-up successful! Please check your email to confirm your account.');
          setMessageType('success');
        }
      } else {
        setMessage('Error creating user profile');
        setMessageType('error');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
        {isClient && message && (
          <p className={`mb-4 ${messageType === 'error' ? 'text-red-500' : 'text-red-500 font-bold animate-bounce'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleAuth}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Passwords must be 6-18 characters long.</p>
          </div>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="username">
                  Display Name
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="club">
                  Club
                </label>
                <input
                  type="text"
                  id="club"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
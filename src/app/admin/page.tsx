// src/app/admin/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import Image from 'next/image';
import useDarkMode from '../../hooks/useDarkMode';

type UserProfile = {
  id: string;
  username: string;
  is_host: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useDarkMode();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, is_host');
      if (error) {
        setMessage('Error fetching users');
      } else {
        setUsers(data as UserProfile[]);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full focus:outline-none"
        >
          {darkMode ? (
            <Image src="/icons/darkMode/sun.png" alt="Light Mode" width={24} height={24} />
          ) : (
            <Image src="/icons/darkMode/moon.png" alt="Dark Mode" width={24} height={24} />
          )}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Admin Page</h1>
        {message && <p className="mb-4 text-red-500 dark:text-red-400">{message}</p>}
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 text-gray-700 dark:text-gray-300">Username</th>
              <th className="py-2 text-gray-700 dark:text-gray-300">Host</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 text-gray-900 dark:text-gray-100">{user.username}</td>
                <td className="py-2 text-gray-900 dark:text-gray-100">{user.is_host ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
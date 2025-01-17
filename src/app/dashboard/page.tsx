//src/app/dashboard/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import DarkModeToggle from '../../components/darkModeToggle';
import LeagueTable from '../../components/leagueTable';
import Sidebar from '../../components/Sidebar';

type UserProfile = {
  id: string;
  username: string;
  is_host: boolean;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setMessage('');
        return;
      }

      const user = session.user;
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, is_host')
          .eq('id', user.id)
          .single();
        if (profileError) {
          setMessage('Error fetching user profile');
        } else {
          setProfile(profile);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex">
      <Sidebar loggedIn={!!profile} isHost={profile?.is_host} />
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Dashboard</h1>
          {profile && (
            <p className="text-lg text-gray-900 dark:text-gray-100 mb-6">Welcome, {profile.username}</p>
          )}
          {message && <p className="mb-4 text-red-500 dark:text-red-400">{message}</p>}
          <LeagueTable />
        </div>
      </div>
    </div>
  );
}
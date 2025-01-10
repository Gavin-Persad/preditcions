//src/app/viewseason/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import DarkModeToggle from '../../components/darkModeToggle';
import Sidebar from '../../components/Sidebar';

type UserProfile = {
  id: string;
  username: string;
  is_host: boolean;
};

type Season = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

type Player = {
  id: string;
  username: string;
};

type SeasonPlayer = {
  player_id: string;
  profiles: {
    username: string;
  }[];
};

export default function ViewSeason() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage('Error fetching user');
        return;
      }

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
    };

    const fetchSeasons = async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('id, name, start_date, end_date');
      if (error) {
        setMessage('Error fetching seasons');
      } else {
        setSeasons(data);
      }
    };

    fetchProfile();
    fetchSeasons();
  }, []);

  const handleSeasonClick = async (season: Season) => {
    setSelectedSeason(season);
    const { data, error } = await supabase
      .from('season_players')
      .select('player_id, profiles!inner(username)')
      .eq('season_id', season.id);
    if (error) {
      setMessage('Error fetching players for the season');
    } else {
      setPlayers(data.map((sp: SeasonPlayer) => ({
        id: sp.player_id,
        username: sp.profiles.length > 0 ? sp.profiles[0].username : 'Unknown'
      })));
    }
  };

  return (
    <div className="flex">
      <Sidebar loggedIn={!!profile} isHost={profile?.is_host} />
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-4xl">
          {message && <p className="mb-4 text-red-500 dark:text-red-400">{message}</p>}
          {!selectedSeason ? (
            <ul className="space-y-4">
              {seasons.map(season => (
                <li key={season.id} className="cursor-pointer" onClick={() => handleSeasonClick(season)}>
                  <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{season.name}</h2>
                    <p className="text-gray-700 dark:text-gray-300">Start Date: {season.start_date}</p>
                    <p className="text-gray-700 dark:text-gray-300">End Date: {season.end_date}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSelectedSeason(null)}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Back to Seasons
              </button>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">{selectedSeason.name}</h2>
              <div className="mb-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Players</h2>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    View Players
                  </button>
                  {profile?.is_host && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                      Edit Players
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">League</h2>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    View League
                  </button>
                  {profile?.is_host && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                      Edit League
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Cups</h2>
                <div className="flex space-x-4 mb-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    View Lavery Cup
                  </button>
                  {profile?.is_host && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                      Edit Lavery Cup
                    </button>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    View George Cup
                  </button>
                  {profile?.is_host && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                      Edit George Cup
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Scores</h2>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                    View Scores
                  </button>
                  {profile?.is_host && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                      Edit Scores
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
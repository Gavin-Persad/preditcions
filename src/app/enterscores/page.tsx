//src/app/enterscores/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import PredictionsForm from './components/PredictionsForm';
import PredictionsDisplay from './components/PredictionsDisplay';
import Sidebar from '../../components/Sidebar';
import DarkModeToggle from '../../components/darkModeToggle';
import { v4 as uuidv4 } from 'uuid';

type GameWeek = {
    id: string;
    week_number: number;
    predictions_open: string;
    predictions_close: string;
    live_start: string;
    live_end: string;
    season_id: string; 
    seasons: {
        id: string;
        name: string;
    };
    lavery_cup_rounds: Array<{
        id: string;
        round_number: number;
        round_name: string;
    }>;
    george_cup_rounds: Array<{
        id: string;
        round_number: number;
        round_name: string;
    }>;
};

type Fixture = {
    id: string;
    fixture_number: number;
    home_team: string;
    away_team: string;
    game_week_id: string;
};

export default function PredictionsPage() {
    const router = useRouter();
    const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGameWeek, setSelectedGameWeek] = useState<string | null>(null);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [predictions, setPredictions] = useState<{[key: string]: {home: number, away: number}}>({});
    const [isEditing, setIsEditing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const checkGameWeekStatus = (gameWeek: GameWeek) => {
        const now = new Date();
        const predOpen = new Date(gameWeek.predictions_open);
        const predClose = new Date(gameWeek.predictions_close);
        const liveStart = new Date(gameWeek.live_start);
        const liveEnd = new Date(gameWeek.live_end);
    
        if (now > liveEnd) return 'past';
        if (now >= liveStart && now <= liveEnd) return 'live';
        if (now >= predOpen && now <= predClose) return 'predictions';
        return 'upcoming';
    };
    

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                router.push('/');
                return;
            }
    
            setUserId(session.user.id);
    
            // First, get the seasons the player is registered for
            const { data: playerSeasons, error: playerSeasonsError } = await supabase
                .from('season_players')
                .select('season_id')
                .eq('player_id', session.user.id);
            
            if (playerSeasonsError) {
                console.error('Error fetching player seasons:', playerSeasonsError);
                setLoading(false);
                return;
            }
    
            // If player isn't in any seasons, show empty list
            if (!playerSeasons || playerSeasons.length === 0) {
                setGameWeeks([]);
                setLoading(false);
                return;
            }
    
            // Extract season IDs
            const seasonIds = playerSeasons.map(ps => ps.season_id);
    
            // Fetch game weeks only for these seasons
            const { data, error } = await supabase
                .from('game_weeks')
                .select(`
                    *,
                    seasons (
                        id,
                        name
                    ),
                    lavery_cup_rounds (
                        id,
                        round_number,
                        round_name
                    ),
                    george_cup_rounds!george_cup_rounds_game_week_id_fkey (
                        id,
                        round_number,
                        round_name
                    )
                `)
                .in('season_id', seasonIds) 
                .order('week_number', { ascending: false });
    
            if (error) {
                console.error('Error:', error);
            } else {
                setGameWeeks(data || []);
            }
            setLoading(false);
        };
    
        checkAuthAndFetchData();
    }, [router]);

    useEffect(() => {
        if (selectedGameWeek) {
            const fetchFixtures = async () => {
                const { data: fixturesData } = await supabase
                    .from('fixtures')
                    .select('*')
                    .eq('game_week_id', selectedGameWeek)
                    .order('fixture_number');

                if (fixturesData) setFixtures(fixturesData);

                const user = (await supabase.auth.getUser()).data.user;
                if (user && fixturesData) {
                    const { data: predictionsData } = await supabase
                        .from('predictions')
                        .select('*')
                        .in('fixture_id', fixturesData.map(f => f.id))
                        .eq('user_id', user.id);

                    if (predictionsData) {
                        const predMap = predictionsData.reduce((acc, pred) => ({
                            ...acc,
                            [pred.fixture_id]: {
                                home: pred.home_prediction,
                                away: pred.away_prediction
                            }
                        }), {});
                        setPredictions(predMap);
                    }
                }
            };
            fetchFixtures();
        }
    }, [selectedGameWeek]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'past':
                return 'bg-slate-100 hover:bg-slate-200 text-slate-700';
            case 'live':
                return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800';
            case 'predictions':
                return 'bg-amber-50 hover:bg-amber-100 text-amber-800';
            case 'upcoming':
                return 'bg-blue-50 hover:bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-50 hover:bg-gray-100 text-gray-800';
        }
    };

    const handleSubmitPredictions = async (data: { 
        scores: { [key: string]: { home: number; away: number } },
        laveryCup?: {
            team1: string;
            team2: string;
            roundId: string;
        }
    }) => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) {
                console.error('No user found');
                return;
            }
    
            const predictionsToUpsert = Object.entries(data.scores).map(([fixture_id, scores]) => ({
                user_id: user.id,
                fixture_id,
                home_prediction: scores.home,
                away_prediction: scores.away,
                updated_at: new Date().toISOString()
            }));
    
            const { error } = await supabase
                .from('predictions')
                .upsert(predictionsToUpsert, {
                    onConflict: 'user_id,fixture_id'
                });
    
            if (error) {
                console.error('Error upserting predictions:', error);
                return;
            }
    
            if (data.laveryCup) {
                const { team1, team2, roundId } = data.laveryCup;
                
                // Check for existing selections first - THIS IS THE KEY ADDITION
                const { data: existingSelections, error: checkError } = await supabase
                    .from('lavery_cup_selections')
                    .select('id')
                    .eq('player_id', user.id)
                    .eq('round_id', roundId)
                    .single();
                    
                if (checkError && checkError.code !== 'PGRST116') {
                    console.error('Error checking existing selections:', checkError);
                    return;
                }
                
                // Get season ID for used teams tracking
                const seasonId = gameWeeks.find(gw => gw.id === selectedGameWeek)?.season_id;
                if (!seasonId) {
                    console.error('Could not find season ID');
                    return;
                }
                
                const laveryCupData = {
                    team1_name: team1,
                    team2_name: team2,
                    team1_won: null,
                    team2_won: null,
                    advanced: false
                };
                
                // If we have existing selections, update them
                if (existingSelections) {
                    // 1. Delete old used teams entries
                    const { data: oldSelections } = await supabase
                        .from('lavery_cup_selections')
                        .select('team1_name, team2_name')
                        .eq('id', existingSelections.id)
                        .single();
                        
                    if (oldSelections) {
                        // Remove old teams from player_used_teams
                        await supabase
                            .from('player_used_teams')
                            .delete()
                            .eq('player_id', user.id)
                            .eq('season_id', seasonId)
                            .in('team_name', [oldSelections.team1_name, oldSelections.team2_name]);
                    }
                    
                    // 2. Update the existing selection
                    const { error: updateError } = await supabase
                        .from('lavery_cup_selections')
                        .update(laveryCupData)
                        .eq('id', existingSelections.id);
                        
                    if (updateError) {
                        console.error('Error updating Lavery Cup selections:', updateError);
                        return;
                    }
                } else {
                    // Create new selection if none exists
                    const { error: laveryCupError } = await supabase
                        .from('lavery_cup_selections')
                        .insert({
                            id: uuidv4(),
                            round_id: roundId,
                            player_id: user.id,
                            ...laveryCupData
                        });
                        
                    if (laveryCupError) {
                        console.error('Error saving Lavery Cup selections:', laveryCupError);
                        return;
                    }
                }
                
                // Always add new teams to used teams table
                const teamsToTrack = [
                    {
                        id: uuidv4(),
                        season_id: seasonId,
                        player_id: user.id,
                        team_name: team1
                    },
                    {
                        id: uuidv4(),
                        season_id: seasonId,
                        player_id: user.id,
                        team_name: team2
                    }
                ];
                
                const { error: teamsError } = await supabase
                    .from('player_used_teams')
                    .upsert(teamsToTrack, { onConflict: 'season_id,player_id,team_name' });
                    
                if (teamsError) {
                    console.error('Error tracking used teams:', teamsError);
                    return;
                }
            }
    
            setPredictions(data.scores);
            setIsEditing(false);
    
        } catch (error) {
            console.error('Error in handleSubmitPredictions:', error);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="absolute top-4 right-4">
                    <DarkModeToggle />
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-4xl">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : !selectedGameWeek ? (
                        <>
                            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                                Game Week Predictions
                            </h1>
                            
                            {gameWeeks.length === 0 ? (
                                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                                    <p>You are not registered for any prediction leagues.</p>
                                    <p className="mt-2">Please contact the host to join a league.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {gameWeeks.map((gameWeek) => {
                                        const status = checkGameWeekStatus(gameWeek);
                                        const hasLaveryCupRound = gameWeek.lavery_cup_rounds && gameWeek.lavery_cup_rounds.length > 0;
                                        const hasGeorgeCupRound = gameWeek.george_cup_rounds && gameWeek.george_cup_rounds.length > 0;
                                        return (
                                            <button
                                                key={gameWeek.id}
                                                onClick={() => setSelectedGameWeek(gameWeek.id)}
                                                className={`w-full p-4 rounded-lg shadow transition-colors duration-200 ${getStatusStyle(status)}`}
                                            >
                                            <div className="flex justify-between items-center">
                                                <div className="text-left">
                                                    <div className="font-medium">
                                                        Game Week {gameWeek.week_number}, {gameWeek.seasons.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(gameWeek.live_start).toLocaleDateString()} - {new Date(gameWeek.live_end).toLocaleDateString()}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {hasLaveryCupRound && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                Lavery Cup - {gameWeek.lavery_cup_rounds[0].round_name}
                                                            </span>
                                                        )}
                                                        {hasGeorgeCupRound && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                George Cup - {gameWeek.george_cup_rounds[0].round_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm">
                                                    {status === 'predictions' && 'Open for Predictions'}
                                                    {status === 'live' && 'Live'}
                                                    {status === 'past' && 'Closed'}
                                                    {status === 'upcoming' && 'Upcoming'}
                                                </span>
                                            </div>
                                            </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                            {checkGameWeekStatus(gameWeeks.find(gw => gw.id === selectedGameWeek)!) === 'predictions' ? (
                                isEditing || Object.keys(predictions).length === 0 ? (
                                <PredictionsForm
                                    fixtures={fixtures}
                                    onSubmit={handleSubmitPredictions}
                                    initialPredictions={predictions}
                                    onBack={() => setSelectedGameWeek(null)}
                                    gameWeekId={selectedGameWeek}
                                    seasonId={gameWeeks.find(gw => gw.id === selectedGameWeek)?.season_id ?? ''}                                    playerId={userId || ''}
                                />
                                ) : (
                                <PredictionsDisplay
                                    fixtures={fixtures}
                                    predictions={predictions}
                                    gameWeekStatus={checkGameWeekStatus(gameWeeks.find(gw => gw.id === selectedGameWeek)!)}
                                    canEdit={true}
                                    onEdit={() => setIsEditing(true)}
                                    onBack={() => setSelectedGameWeek(null)}
                                    gameWeekId={selectedGameWeek}
                                    playerId={userId || ''}
                                />
                                )
                            ) : (
                                <PredictionsDisplay
                                    fixtures={fixtures}
                                    predictions={predictions}
                                    gameWeekStatus={checkGameWeekStatus(gameWeeks.find(gw => gw.id === selectedGameWeek)!)}
                                    canEdit={true}
                                    onEdit={() => setIsEditing(true)}
                                    onBack={() => setSelectedGameWeek(null)}
                                    gameWeekId={selectedGameWeek}
                                    playerId={userId || ''}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
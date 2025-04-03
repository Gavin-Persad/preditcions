//src/app/viewseason/components/GeorgeCup/EditGeorgeCup.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../supabaseClient";
import { Player } from '../../../../types/players';
import { GameWeek } from '../../../../types/gameWeek';
import { Layout } from "./layout";


interface Props {
    seasonId: string;
    onClose: () => void;
}

type RoundState = {
    id: string;
    round_number: number;
    round_name: string;
    game_week_id: string | null;
    is_complete: boolean;
    total_fixtures: number;
    fixtures: FixtureState[];
};

type FixtureState = {
    id: string;
    player1_id: string | null;
    player2_id: string | null;
    winner_id: string | null;
    fixture_number: number;
    player1_score?: number;
    player2_score?: number;
    winner_method?: WinnerMethod | null;
};

type WinnerMethod = 'points' | 'correct_scores' | 'coin_flip';

type PlayerResponse = {
    profiles: {
        id: string;
        username: string;
    };
};

type DrawConfirmationModalProps = {
    onConfirm: () => void;
    onCancel: () => void;
    roundName: string;
    gameWeekNumber: number;
};

const isPlayer = (slot: Player | 'BYE'): slot is Player => {
    return slot !== 'BYE';
};

const determineWinner = (
    player1: { id: string; score: number; correctScores: number } | null,
    player2: { id: string; score: number; correctScores: number } | null
): string | null => {
    // Handle BYE cases
    if (!player2?.id) return player1?.id || null;
    if (!player1?.id) return player2?.id || null;

    // Compare scores
    if (player1.score > player2.score) return player1.id;
    if (player2.score > player1.score) return player2.id;

    // If scores are equal, compare correct scores
    if (player1.correctScores > player2.correctScores) return player1.id;
    if (player2.correctScores > player1.correctScores) return player2.id;

    // If everything is equal, random selection (coin flip)
    return Math.random() < 0.5 ? player1.id : player2.id;
}

const DrawConfirmationModal = ({ onConfirm, onCancel, roundName, gameWeekNumber }: DrawConfirmationModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Confirm Draw
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Are you sure you want to draw fixtures for {roundName} using Game Week {gameWeekNumber}? 
                    This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Draw Fixtures
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function EditGeorgeCup({ seasonId, onClose }: Props) {
    const [rounds, setRounds] = useState<RoundState[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [selectedGameWeekId, setSelectedGameWeekId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
const [fixtureScores, setFixtureScores] = useState<Record<string, { 
    player1_score?: number,
    player1_correct_scores?: number,
    player2_score?: number,
    player2_correct_scores?: number
}>>({});

    const initializationRef = React.useRef<{initialized: boolean; cleanup: boolean}>({
        initialized: false,
        cleanup: false
    });


    useEffect(() => {
        // Capture ref value at start of effect
        const cleanupRef = initializationRef.current;
        
        // If already initialized or cleanup in progress, skip
        if (cleanupRef.initialized || cleanupRef.cleanup) {
            return;
        }
        
        cleanupRef.initialized = true;
        
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                
                // Always fetch players first
                const { data: playersData, error: playersError } = await supabase
                    .from('season_players')
                    .select(`
                        profiles (
                            id,
                            username
                        )
                    `)
                    .eq('season_id', seasonId);
        
                if (playersError) throw playersError;
                
                const mappedPlayers = (playersData as unknown as PlayerResponse[]).map(p => ({
                    id: p.profiles.id,
                    username: p.profiles.username
                }));
                setPlayers(mappedPlayers);
        
                // Check for existing rounds
                const { data: existingRounds, error: checkError } = await supabase
                    .from('george_cup_rounds')
                    .select(`
                        *,
                        george_cup_fixtures!george_cup_fixtures_round_id_fkey (
                            id,
                            round_id,
                            fixture_number,
                            player1_id,
                            player2_id,
                            winner_id
                        )
                    `)
                    .eq('season_id', seasonId)
                    .order('round_number', { ascending: true });
        
                if (checkError) throw checkError;
        
                if (!existingRounds || existingRounds.length === 0) {
                    // Create initial rounds using already fetched players
                    const requiredRounds = calculateRequiredRounds(mappedPlayers.length);
                    const initialRounds = Array.from({ length: requiredRounds }, (_, i) => ({
                        season_id: seasonId,
                        round_number: i + 1,
                        round_name: i === requiredRounds - 1 ? 'Final' :
                                   i === requiredRounds - 2 ? 'Semi Finals' :
                                   i === requiredRounds - 3 ? 'Quarter Finals' :
                                   `Round ${i + 1}`,
                        game_week_id: null,
                        is_complete: false,
                        total_fixtures: Math.pow(2, requiredRounds - (i + 1))
                    }));
        
                    const { data: createdRounds, error: createError } = await supabase
                        .from('george_cup_rounds')
                        .insert(initialRounds)
                        .select();
        
                    if (createError) throw createError;
                    setRounds(createdRounds.map(round => ({ ...round, fixtures: [] })));
                } else {
                    setRounds(existingRounds.map(round => ({
                        ...round,
                        fixtures: round.george_cup_fixtures || []
                    })));
                }
        
                // Fetch game weeks
                const { data: gameWeeksData, error: gameWeeksError } = await supabase
                    .from('game_weeks')
                    .select('*')
                    .eq('season_id', seasonId)
                    .order('live_start', { ascending: true });
        
                if (gameWeeksError) throw gameWeeksError;
                setGameWeeks(gameWeeksData || []);
        
            } catch (error) {
                console.error('Error in fetchInitialData:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    
        return () => {
            cleanupRef.cleanup = true;
        };
    }, [seasonId]);

    useEffect(() => {
        const updateRoundScores = async () => {
            const updatedRounds = await Promise.all(rounds.map(async (round) => {
                if (!round.game_week_id) return round;
    
                const { data: scores } = await supabase
                    .from('game_week_scores')
                    .select('player_id, points')
                    .eq('game_week_id', round.game_week_id);
    
                if (!scores) return round;
    
                const updatedFixtures = round.fixtures.map(fixture => ({
                    ...fixture,
                    player1_score: scores.find(s => s.player_id === fixture.player1_id)?.points ?? null,
                    player2_score: scores.find(s => s.player_id === fixture.player2_id)?.points ?? null
                }));
    
                return {
                    ...round,
                    fixtures: updatedFixtures
                };
            }));
    
            setRounds(updatedRounds);
        };
    
        if (rounds.length > 0) {
            updateRoundScores();
        }
    }, [rounds]);

    const calculateRequiredRounds = (playerCount: number) => {
        return Math.ceil(Math.log2(playerCount));
    };
    
    const calculateByesNeeded = (playerCount: number) => {
        const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(playerCount)));
        return nextPowerOfTwo - playerCount;
    };
    
    const distributeByes = (players: Player[], byesNeeded: number) => {
        const totalPlayers = players.length;
        const requiredPlayers = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
        const firstRoundFixtures = requiredPlayers / 2;
        const firstRoundPlayers = firstRoundFixtures * 2;
        
        // Create array of all player slots
        let slots: (Player | 'BYE')[] = [...players];
        
        // Add BYE slots
        for (let i = 0; i < byesNeeded; i++) {
            slots.push('BYE');
        }
        
        // Shuffle array to randomize BYE positions
        for (let i = slots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [slots[i], slots[j]] = [slots[j], slots[i]];
        }
        
        return slots;
    };

    const performDraw = useCallback(async (roundId: string) => {
        try {
            const round = rounds.find(r => r.id === roundId);
            if (!round || !selectedGameWeekId) return;
    
            // Check for existing fixtures first
            const { data: existingFixtures } = await supabase
                .from('george_cup_fixtures')
                .select('*')
                .eq('round_id', roundId);
    
            // If fixtures already exist, don't create new ones
            if (existingFixtures && existingFixtures.length > 0) {
                console.error('Fixtures already exist for this round');
                return;
            }

            // For first round, pair up players and BYEs
            if (round.round_number === 1) {
                const byesNeeded = calculateByesNeeded(players.length);
                const slots = distributeByes(players, byesNeeded);
    
                // Create fixtures from slots with type checking
                const fixtures = [];
                for (let i = 0; i < slots.length; i += 2) {
                    const player1 = slots[i];
                    const player2 = slots[i + 1];
                    
                    fixtures.push({
                        round_id: roundId,
                        fixture_number: (i / 2) + 1,
                        player1_id: isPlayer(player1) ? player1.id : null,
                        player2_id: isPlayer(player2) ? player2.id : null,
                        winner_id: null
                    });
                }
    
                // Insert fixtures into database
                const { error: fixturesError } = await supabase
                    .from('george_cup_fixtures')
                    .insert(fixtures)
                    .select(); // Add select to get the created fixtures
    
                if (fixturesError) {
                    console.error('Fixtures Error:', fixturesError);
                    throw fixturesError;
                }
            } else {
                // For subsequent rounds, create empty fixtures
                const previousRound = rounds.find(r => r.round_number === round.round_number - 1);
                if (!previousRound) throw new Error('Previous round not found');
    
                const numFixtures = Math.ceil(previousRound.fixtures.length / 2);
                const emptyFixtures = Array(numFixtures).fill(null).map((_, index) => ({
                    round_id: roundId,
                    fixture_number: index + 1,
                    player1_id: null,
                    player2_id: null,
                    winner_id: null
                }));
    
                const { error: fixturesError } = await supabase
                    .from('george_cup_fixtures')
                    .insert(emptyFixtures)
                    .select();
    
                if (fixturesError) {
                    console.error('Fixtures Error:', fixturesError);
                    throw fixturesError;
                }
            }
    
            // Update round with selected game week
            const { error: updateError } = await supabase
                .from('george_cup_rounds')
                .update({ 
                    game_week_id: selectedGameWeekId,
                    is_complete: false 
                })
                .eq('id', roundId);
    
            if (updateError) {
                console.error('Update Error:', updateError);
                throw updateError;
            }
    
        // After successful draw, fetch ALL rounds to ensure consistency
        const { data: updatedRounds, error: fetchError } = await supabase
            .from('george_cup_rounds')
            .select(`
                *,
                george_cup_fixtures!george_cup_fixtures_round_id_fkey (
                    id,
                    round_id,
                    fixture_number,
                    player1_id,
                    player2_id,
                    winner_id
                )
            `)
            .eq('season_id', seasonId)
            .order('round_number', { ascending: true });

        if (fetchError) {
            console.error('Fetch Error:', fetchError);
            throw fetchError;
        }

        // Update all rounds at once to prevent flickering
        setRounds(updatedRounds.map(round => ({
            ...round,
            fixtures: round.george_cup_fixtures || []
        })));

    } catch (error) {
        console.error('Error in performDraw:', error);
    }
}, [rounds, selectedGameWeekId, seasonId, players]);

    const progressWinnersToNextRound = useCallback(async (currentRound: RoundState) => {
        try {
            const nextRound = rounds.find(r => r.round_number === currentRound.round_number + 1);
            if (!nextRound) return;
    
            const winners = currentRound.fixtures
                .filter(f => f.winner_id)
                .map(f => f.winner_id)
                .filter((id): id is string => id !== null);
    
            // Update next round's fixtures with winners
            for (let i = 0; i < winners.length; i += 2) {
                await supabase
                    .from('george_cup_fixtures')
                    .update({
                        player1_id: winners[i],
                        player2_id: winners[i + 1] || null
                    })
                    .eq('round_id', nextRound.id)
                    .eq('fixture_number', Math.floor(i/2) + 1);
            }
    
            // Refresh the rounds data
            const { data: updatedRound } = await supabase
                .from('george_cup_rounds')
                .select(`
                    *,
                    george_cup_fixtures!george_cup_fixtures_round_id_fkey (
                        id,
                        round_id,
                        fixture_number,
                        player1_id,
                        player2_id,
                        winner_id
                    )
                `)
                .eq('id', nextRound.id)
                .single();
    
            if (updatedRound) {
                setRounds(rounds.map(r => 
                    r.id === nextRound.id 
                        ? { ...updatedRound, fixtures: updatedRound.george_cup_fixtures || [] }
                        : r
                ));
            }
        } catch (error) {
            console.error('Error in progressWinnersToNextRound:', error);
        }
    }, [rounds]);

    const handleGameWeekSelect = React.useCallback((roundId: string, gameWeekId: string) => {
        if (!gameWeekId) return;
        
        // Update state in one batch
        requestAnimationFrame(() => {
            setSelectedRoundId(roundId);
            setSelectedGameWeekId(gameWeekId);
            setShowDrawModal(true);
        });
    }, []);

    useEffect(() => {
        const checkGameWeekScores = async (roundId: string) => {
            try {
                const round = rounds.find(r => r.id === roundId);
                if (!round || !round.game_week_id) return;
        
                // Update the query to include correct_scores
                const { data: scores } = await supabase
                    .from('game_week_scores')
                    .select('player_id, points, correct_scores') // Added correct_scores
                    .eq('game_week_id', round.game_week_id);
        
                if (!scores) return;

                const updatedFixtures = await Promise.all(round.fixtures.map(async fixture => {
                    if (!fixture.player1_id || fixture.winner_id) return fixture;
                
                    const player1Score = scores.find(s => s.player_id === fixture.player1_id);
                    const player2Score = scores.find(s => s.player_id === fixture.player2_id);
                
                    // Add type checking before calling determineWinner
                    const player1Data = player1Score && fixture.player1_id ? {
                        id: fixture.player1_id,
                        score: player1Score.points || 0,
                        correctScores: player1Score.correct_scores || 0
                    } : null;
                
                    const player2Data = player2Score && fixture.player2_id ? {
                        id: fixture.player2_id,
                        score: player2Score.points || 0,
                        correctScores: player2Score.correct_scores || 0
                    } : null;
                
                    const winnerId = determineWinner(player1Data, player2Data);
                
                    if (winnerId) {
                        // Update fixture in database
                        const { error: updateError } = await supabase
                            .from('george_cup_fixtures')
                            .update({ winner_id: winnerId })
                            .eq('id', fixture.id);
                
                        if (updateError) throw updateError;
                        return { ...fixture, winner_id: winnerId };
                    }
                
                    return fixture;
                }));
        
                // Check if all fixtures have winners
                const allFixturesComplete = updatedFixtures.every(f => 
                    f.winner_id || (!f.player1_id && !f.player2_id)
                );
        
                if (allFixturesComplete) {
                    // Mark round as complete
                    await supabase
                        .from('george_cup_rounds')
                        .update({ is_complete: true })
                        .eq('id', roundId);
        
                    // Progress winners to next round
                    await progressWinnersToNextRound({
                        ...round,
                        fixtures: updatedFixtures,
                        is_complete: true
                    });
                }
        
                // Update local state
                setRounds(rounds.map(r => 
                    r.id === roundId 
                        ? { ...r, fixtures: updatedFixtures, is_complete: allFixturesComplete }
                        : r
                ));
        
            } catch (error) {
                console.error('Error checking game week scores:', error);
            }
        };
    
        // Call checkGameWeekScores for each round that has a game week assigned
        rounds.forEach(round => {
            if (round.game_week_id) {
                checkGameWeekScores(round.id);
            }
        });
    }, [rounds, progressWinnersToNextRound]);

    useEffect(() => {
        const fetchScores = async () => {
            if (!rounds.length) return;
            
            const scores: Record<string, { 
                player1_score?: number,
                player1_correct_scores?: number,
                player2_score?: number,
                player2_correct_scores?: number 
            }> = {};
            
            const roundsWithGameWeeks = rounds.filter(round => round.game_week_id);
            if (!roundsWithGameWeeks.length) return;
    
            try {
                // Fetch all scores in one query
                const { data: allGameWeekScores } = await supabase
                    .from('game_week_scores')
                    .select('game_week_id, player_id, points, correct_scores')
                    .in('game_week_id', roundsWithGameWeeks.map(r => r.game_week_id));
    
                if (!allGameWeekScores) return;
    
                // Process scores for each round
                roundsWithGameWeeks.forEach(round => {
                    const gameWeekScores = allGameWeekScores.filter(s => s.game_week_id === round.game_week_id);
                    
                    round.fixtures.forEach(fixture => {
                        const player1Score = gameWeekScores.find(s => s.player_id === fixture.player1_id);
                        const player2Score = gameWeekScores.find(s => s.player_id === fixture.player2_id);
                        
                        scores[fixture.id] = {
                            player1_score: player1Score?.points,
                            player1_correct_scores: player1Score?.correct_scores,
                            player2_score: player2Score?.points,
                            player2_correct_scores: player2Score?.correct_scores
                        };
                    });
                });
                
                setFixtureScores(scores);
            } catch (error) {
                console.error('Error checking game week scores:', error);
            }
        };
    
        fetchScores();
    }, [rounds]);
    
    const handleConfirmDraw = useCallback(async () => {
        try {
            if (!selectedRoundId || !selectedGameWeekId) return;
            await performDraw(selectedRoundId);
            
            requestAnimationFrame(() => {
                setShowDrawModal(false);
                setSelectedRoundId(null);
                setSelectedGameWeekId(null);
            });
        } catch (error) {
            console.error('Error in handleConfirmDraw:', error);
        }
    }, [selectedRoundId, selectedGameWeekId, performDraw]);
    
    const handleCancelDraw = React.useCallback(() => {
        // Reset state in one batch
        requestAnimationFrame(() => {
            setShowDrawModal(false);
            setSelectedRoundId(null);
            setSelectedGameWeekId(null);
        });
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    George Cup
                </h2>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    Back
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center">
                    <p className="text-gray-900 dark:text-gray-100">Loading...</p>
                </div>
            ) : (
                <div className={Layout.container}>
                    {/* Players Column */}
                    <div className={Layout.column}>
                        <h3 className={Layout.roundTitle}>Players</h3>
                        <div className="space-y-2">
                            {players.map(player => (
                                <div key={player.id} className={Layout.playerBox.base}>
                                    {player.username}
                                </div>
                            ))}
                        </div>
                    </div>
    
                {/* Round Columns */}
                {rounds.map(round => (
                    <div key={round.id} className={`${Layout.column} ${
                        round.is_complete ? Layout.pastRound : Layout.activeRound
                    }`}>
                        <h3 className={Layout.roundTitle}>{round.round_name}</h3>
                    <select 
                        className={Layout.gameWeekSelect}
                        value={round.game_week_id || ''}
                        onChange={(e) => handleGameWeekSelect(round.id, e.target.value)}
                        disabled={round.is_complete || round.fixtures?.length > 0}
                    >
                        <option value="">Select Game Week</option>
                        {gameWeeks.map(gw => (
                            <option key={gw.id} value={gw.id}>
                                Game Week {gw.week_number}
                            </option>
                        ))}
                    </select>
                        
                        {/* Fixtures */}
                        <div className="space-y-2">
                            {round.fixtures?.length > 0 ? (
                                round.fixtures.map(fixture => (
                                    <div key={fixture.id} className={Layout.fixtureBox}>
                                        <div className={`${Layout.playerBox.base} ${
                                            fixture.winner_id === fixture.player1_id ? Layout.playerBox.winner :
                                            fixture.winner_id && fixture.player1_id ? Layout.playerBox.loser :
                                            !fixture.player1_id ? Layout.playerBox.bye : ''
                                        }`}>
                                            <div className={Layout.playerBox.base}>
                                                <span>
                                                    {fixture.player1_id ? 
                                                        players.find(p => p.id === fixture.player1_id)?.username : 
                                                        'Undecided'
                                                    }
                                                </span>
                                                <span className={Layout.playerBox.score}>
                                                    <span className="text-lg font-bold">{fixtureScores[fixture.id]?.player1_score}</span>
                                                    {fixtureScores[fixture.id]?.player1_correct_scores !== undefined && (
                                                        <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">
                                                            ({fixtureScores[fixture.id]?.player1_correct_scores})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-1">vs</div>

                                        <div className={`${Layout.playerBox.base} ${
                                            fixture.winner_id === fixture.player2_id ? Layout.playerBox.winner :
                                            fixture.winner_id && fixture.player2_id ? Layout.playerBox.loser :
                                            !fixture.player2_id ? Layout.playerBox.bye : ''
                                        }`}>
                                            <div className={Layout.playerBox.base}>
                                                <span>
                                                    {fixture.player2_id ? 
                                                        players.find(p => p.id === fixture.player2_id)?.username : 
                                                        'Undecided'
                                                    }
                                                </span>
                                                <span className={Layout.playerBox.score}>
                                                <span className="text-lg font-bold">{fixtureScores[fixture.id]?.player2_score}</span>
                                                {fixtureScores[fixture.id]?.player2_correct_scores !== undefined && (
                                                    <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">
                                                        ({fixtureScores[fixture.id]?.player2_correct_scores})
                                                    </span>
                                                )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Show placeholder boxes when no fixtures exist
                                Array(round.total_fixtures).fill(null).map((_, index) => (
                                    <div key={`empty-${round.id}-${index}`} className={Layout.fixtureBox}>
                                        <div className={`${Layout.playerBox.base} ${Layout.playerBox.bye}`}>
                                            Undecided
                                        </div>
                                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-1">vs</div>
                                        <div className={`${Layout.playerBox.base} ${Layout.playerBox.bye}`}>
                                            Undecided
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
            ))}
            </div>
        )}

        {/* Draw Confirmation Modal */}
        {showDrawModal && selectedRoundId && selectedGameWeekId && (
    <DrawConfirmationModal
        roundName={rounds.find(r => r.id === selectedRoundId)?.round_name || ''}
        gameWeekNumber={gameWeeks.find(gw => gw.id === selectedGameWeekId)?.week_number || 0}
        onConfirm={handleConfirmDraw}
        onCancel={handleCancelDraw}
    />
)}
    </div>
);
}
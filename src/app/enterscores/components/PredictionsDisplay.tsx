//src/app/enterscores/components/PredictionsDisplay.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import ScoreBreakdown from './ScoreBreakdown';
import { calculatePoints, calculateWeeklyCorrectScoreBonus } from '../../../utils/scoreCalculator';

type PredictionDisplayProps = {
    fixtures: Array<{
        id: string;
        home_team: string;
        away_team: string;
        fixture_number: number;
        home_score?: number | null;
        away_score?: number | null;
    }>;
    predictions: {
        [key: string]: {
            home: number;
            away: number;
            points?: number;
        };
    };
    gameWeekStatus: 'past' | 'live' | 'predictions' | 'upcoming';
    canEdit?: boolean;
    onEdit?: () => void;
    onBack: () => void;
    gameWeekId?: string; // Add this
    playerId?: string;   // Add this
};

type LaveryCupRound = {
    id: string;
    round_number: number;
    round_name: string;
    game_week_id: string;
};

type LaveryCupSelection = {
    team1_name: string;
    team2_name: string;
    team1_won: boolean | null;
    team2_won: boolean | null;
    advanced: boolean;
};

    export default function PredictionsDisplay({ 
        fixtures, 
        predictions, 
        gameWeekStatus, 
        canEdit, 
        onEdit,
        onBack,
        gameWeekId,
        playerId
    }: PredictionDisplayProps) {
        const [laveryCupRound, setLaveryCupRound] = useState<LaveryCupRound | null>(null);
        const [laveryCupSelection, setLaveryCupSelection] = useState<LaveryCupSelection | null>(null);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            const fetchLaveryCupData = async () => {
                if (!gameWeekId || !playerId) return;
                
                setLoading(true);
                try {
                    // Check if this game week is part of a Lavery Cup round
                    const { data: roundData } = await supabase
                        .from('lavery_cup_rounds')
                        .select('*')
                        .eq('game_week_id', gameWeekId)
                        .single();
                    
                    if (roundData) {
                        setLaveryCupRound(roundData);
                        
                        // Get the user's selections for this round
                        const { data: selectionData } = await supabase
                            .from('lavery_cup_selections')
                            .select('*')
                            .eq('round_id', roundData.id)
                            .eq('player_id', playerId)
                            .single();
                        
                        if (selectionData) {
                            setLaveryCupSelection(selectionData);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching Lavery Cup data:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchLaveryCupData();
        }, [gameWeekId, playerId]);

        // Add a helper function to render team status
        const renderTeamStatus = (won: boolean | null) => {
            if (won === null) return null;
            if (won) return <span className="text-green-600 font-bold">(Won)</span>;
            return <span className="text-red-600 font-bold">(Lost)</span>;
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                        Back
                    </button>
                    {canEdit && gameWeekStatus === 'predictions' && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit Predictions
                        </button>
                    )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Predictions</h2>
                
                <div className="space-y-4">
                    {fixtures.map((fixture) => (
                        <div key={fixture.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-900 dark:text-white">
                            <div className="text-center sm:text-right text-sm sm:text-base">{fixture.home_team}</div>
                            <div className="flex justify-center space-x-2 font-bold">
                                {predictions[fixture.id] ? (
                                    <>
                                        <span>{predictions[fixture.id].home}</span>
                                        <span>-</span>
                                        <span>{predictions[fixture.id].away}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400">No prediction</span>
                                )}
                            </div>
                            <div className="text-center sm:text-left text-sm sm:text-base">{fixture.away_team}</div>
                        </div>
                    ))}
                </div>
                
                {/* Lavery Cup Selections */}
                {laveryCupRound && laveryCupSelection && (
                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Lavery Cup Selections - {laveryCupRound.round_name}
                        </h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Team 1</p>
                                    <p className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <span>{laveryCupSelection.team1_name}</span>
                                    {gameWeekStatus === 'past' && renderTeamStatus(laveryCupSelection.team1_won)}

                                    </p>
                                </div>
                                
                                <div className="flex flex-col">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Team 2</p>
                                    <p className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <span>{laveryCupSelection.team2_name}</span>
                                    {gameWeekStatus === 'past' && renderTeamStatus(laveryCupSelection.team2_won)}
                                    </p>
                                </div>
                            </div>
                            
                            {gameWeekStatus === 'past' && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Status: {laveryCupSelection.advanced ? (
                                            <span className="text-green-600">Advanced to next round</span>
                                        ) : (
                                            <span className="text-red-600">Eliminated</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
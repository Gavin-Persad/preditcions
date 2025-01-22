//src/components/CreateGameWeek.tsx

"use client";

import { useState } from 'react';
import { supabase } from '../../supabaseClient';

type CreateGameWeekProps = {
    seasonId: string;
    onClose: () => void;
};

export default function CreateGameWeek({ seasonId, onClose }: CreateGameWeekProps) {
    const [predictionsOpen, setPredictionsOpen] = useState('');
    const [liveStart, setLiveStart] = useState('');
    const [liveEnd, setLiveEnd] = useState('');
    const [fixtures, setFixtures] = useState<Array<{number: number, home: string, away: string}>>([
        ...Array(10).fill(null).map((_, i) => ({
            number: i + 1,
            home: '',
            away: ''
        }))
    ]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const calculatePredictionsClose = () => {
        if (!liveStart) return '';
        const date = new Date(liveStart);
        date.setDate(date.getDate() - 1);
        date.setHours(23, 59, 59);
        return date.toISOString().slice(0, 16);
    };

    const validateDates = () => {
        const predOpen = new Date(predictionsOpen);
        const predClose = new Date(calculatePredictionsClose());
        const gameStart = new Date(liveStart);
        const gameEnd = new Date(liveEnd);

        if (predOpen >= predClose) {
            setMessage('Predictions must open before they close');
            return false;
        }
        if (predClose >= gameStart) {
            setMessage('Predictions must close before games start');
            return false;
        }
        if (gameStart >= gameEnd) {
            setMessage('Game week must start before it ends');
            return false;
        }
        return true;
    };

    const handleFixtureChange = (index: number, field: 'home' | 'away', value: string) => {
        const newFixtures = [...fixtures];
        newFixtures[index][field] = value;
        setFixtures(newFixtures);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);
    
        // Validate form
        if (!predictionsOpen || !liveStart || !liveEnd) {
            setMessage('All fields are required');
            setIsSubmitting(false);
            return;
        }
    
        if (!validateDates()) {
            setIsSubmitting(false);
            return;
        }
    
        if (fixtures.some(f => !f.home || !f.away)) {
            setMessage('All fixtures must have both teams');
            setIsSubmitting(false);
            return;
        }
    
        try {
            // Insert game week
            const { data: gameWeek, error: gameWeekError } = await supabase
                .from('game_weeks')
                .insert([{
                    season_id: seasonId,
                    predictions_open: predictionsOpen,
                    predictions_close: calculatePredictionsClose(),
                    live_start: liveStart,
                    live_end: liveEnd
                }])
                .select()
                .single();
    
            if (gameWeekError) throw gameWeekError;
    
            // Insert fixtures
            const { error: fixturesError } = await supabase
                .from('fixtures')
                .insert(
                    fixtures.map(f => ({
                        game_week_id: gameWeek.id,
                        fixture_number: f.number,
                        home_team: f.home,
                        away_team: f.away,
                        home_score: 0,
                        away_score: 0
                    }))
                );
    
            if (fixturesError) throw fixturesError;
    
            onClose();
        } catch (error) {
            setMessage('Error creating game week');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
                Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Game Week</h2>
            
            {message && <p className="mb-4 text-red-500 dark:text-red-400">{message}</p>}
            
            <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Predictions Open
                        <input
                            type="datetime-local"
                            value={predictionsOpen}
                            onChange={(e) => setPredictionsOpen(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </label>
    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Live Start
                        <input
                            type="datetime-local"
                            value={liveStart}
                            onChange={(e) => setLiveStart(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </label>
    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Predictions Close (Auto-calculated)
                        <input
                            type="datetime-local"
                            value={calculatePredictionsClose()}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                            disabled
                        />
                    </label>
    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Live End
                        <input
                            type="datetime-local"
                            value={liveEnd}
                            onChange={(e) => setLiveEnd(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </label>
                </div>
    
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Fixtures</h3>
                    {fixtures.map((fixture, index) => (
                        <div key={fixture.number} className="grid grid-cols-2 gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Home Team {fixture.number}
                                <input
                                    type="text"
                                    value={fixture.home}
                                    onChange={(e) => handleFixtureChange(index, 'home', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </label>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Away Team {fixture.number}
                                <input
                                    type="text"
                                    value={fixture.away}
                                    onChange={(e) => handleFixtureChange(index, 'away', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </label>
                        </div>
                    ))}
                </div>
    
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Game Week'}
                    </button>
                </div>
            </form>
        </div>
    );
}
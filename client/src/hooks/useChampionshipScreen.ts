import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { SERVER_URL } from '../services/socket';
import { ChampionshipResponse } from '@shared/championship';
import { computeSeasonStats } from '../utils/championshipStats';

export const useChampionshipScreen = () => {
  const { error, joinChampionship, setChampionshipOpen, initializeSocket } = useGameStore();

  const [data, setData] = useState<ChampionshipResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const load = useCallback(async (season: number | null) => {
    try {
      const query = season ? `?season=${season}` : '';
      const res = await fetch(`${SERVER_URL}/api/championship${query}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLoadError(null);
    } catch {
      setLoadError('Could not load championship data');
    }
  }, []);

  useEffect(() => {
    load(selectedSeason);
  }, [load, selectedSeason]);

  const handleReset = async () => {
    if (resetInput !== 'RESET') return;
    setIsResetting(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/championship/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      });
      if (!res.ok) throw new Error();
      setShowReset(false);
      setResetInput('');
      setSelectedSeason(null);
      await load(null);
    } catch {
      setLoadError('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const season = data?.season ?? null;
  const isCurrentSeason = !!data && data.season.number === data.currentSeason;

  return {
    error: loadError || error,
    data,
    season,
    stats: season ? computeSeasonStats(season.games) : null,
    isCurrentSeason,
    setSelectedSeason,
    joinChampionship,
    close: () => setChampionshipOpen(false),
    showReset,
    setShowReset,
    resetInput,
    setResetInput,
    isResetting,
    handleReset,
  };
};

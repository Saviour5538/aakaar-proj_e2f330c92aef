import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getMatches } from '../api/client';
import { Match, StatsResponse } from '../types';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        const response = await getStats();
        setStats(response);
      } catch (err) {
        setError('Failed to fetch stats.');
        toast.error('Failed to fetch stats.');
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchMatches = async () => {
      setLoadingMatches(true);
      setError(null);
      try {
        const response = await getMatches();
        setMatches(response);
      } catch (err) {
        setError('Failed to fetch matches.');
        toast.error('Failed to fetch matches.');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchStats();
    fetchMatches();
  }, []);

  const handleNewGame = () => {
    navigate('/game');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Wins</h2>
          {loadingStats ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{stats?.wins || 0}</p>
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Losses</h2>
          {loadingStats ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{stats?.losses || 0}</p>
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Draws</h2>
          {loadingStats ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{stats?.draws || 0}</p>
          )}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
        {loadingMatches ? (
          <p className="text-gray-500">Loading...</p>
        ) : matches.length > 0 ? (
          <ul className="bg-white shadow rounded-lg divide-y divide-gray-200">
            {matches.slice(0, 5).map((match) => (
              <li key={match.id} className="p-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Match ID:</span> {match.id}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Result:</span> {match.result}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Date:</span> {new Date(match.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent matches found.</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleNewGame}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
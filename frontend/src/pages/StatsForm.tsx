import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createStat, updateStat, getStatById } from '../api/client';

interface StatFormValues {
  playerName: string;
  wins: number;
  losses: number;
  draws: number;
}

const StatsForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<StatFormValues>({
    playerName: '',
    wins: 0,
    losses: 0,
    draws: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchStat = async () => {
        setLoading(true);
        setError(null);
        try {
          const stat = await getStatById(Number(id));
          setFormValues({
            playerName: stat.playerName,
            wins: stat.wins,
            losses: stat.losses,
            draws: stat.draws,
          });
        } catch (err) {
          setError('Failed to fetch stat.');
        } finally {
          setLoading(false);
        }
      };

      fetchStat();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: name === 'playerName' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateStat(Number(id), formValues);
      } else {
        await createStat(formValues);
      }
      navigate('/stats');
    } catch (err) {
      setError('Failed to save stat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Stat' : 'Add New Stat'}</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Player Name</label>
          <input
            type="text"
            name="playerName"
            value={formValues.playerName}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Wins</label>
          <input
            type="number"
            name="wins"
            value={formValues.wins}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Losses</label>
          <input
            type="number"
            name="losses"
            value={formValues.losses}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Draws</label>
          <input
            type="number"
            name="draws"
            value={formValues.draws}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default StatsForm;
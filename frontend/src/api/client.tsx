import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Match {
  id: string;
  player1: string;
  player2: string;
  winner: string | null;
  board: string[][];
  turn: string;
  created_at: string;
}

export interface MatchResponse {
  matches: Match[];
}

export interface StatsResponse {
  wins: number;
  losses: number;
  draws: number;
}

export const register = async (data: RegisterRequest): Promise<TokenResponse> => {
  try {
    const response = await api.post<TokenResponse>('/api/auth/register', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  try {
    const response = await api.post<TokenResponse>('/api/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMatch = async (): Promise<Match> => {
  try {
    const response = await api.post<Match>('/api/matches');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMatches = async (): Promise<MatchResponse> => {
  try {
    const response = await api.get<MatchResponse>('/api/matches');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get<StatsResponse>('/api/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

// Auto-added stubs for functions a page imported but the client omitted.
export const createStat = async (data?: any) => {
  const res = await api.post('/api/stats', data);
  return res.data;
};
export const deleteMatch = async (id: string) => {
  const res = await api.delete(`/api/matchs/${id}`);
  return res.data;
};
export const deleteStat = async (id: string) => {
  const res = await api.delete(`/api/stats/${id}`);
  return res.data;
};
export const getMatch = async (id: string) => {
  const res = await api.get(`/api/matchs/${id}`);
  return res.data;
};
export const getStatById = async (id: string) => {
  const res = await api.get(`/api/statbyids/${id}`);
  return res.data;
};
export const updateMatch = async (id: string, data?: any) => {
  const res = await api.put(`/api/matchs/${id}`, data);
  return res.data;
};
export const updateStat = async (id: string, data?: any) => {
  const res = await api.put(`/api/stats/${id}`, data);
  return res.data;
};

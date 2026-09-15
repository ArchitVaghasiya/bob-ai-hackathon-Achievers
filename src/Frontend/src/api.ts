import { type Asset, mockAssets } from './data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchLivePredictions(): Promise<Asset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assets`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch live predictions from Neon DB, falling back to mock data:", error);
    // Return mock data if backend is not available
    return mockAssets;
  }
}

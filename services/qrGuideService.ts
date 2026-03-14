import { get, post } from './http';

export interface QrArtifact {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  audioDuration: string;
  year: string;
  tags: string[];
}

export interface ScanHistory {
  id: string;
  userEmail: string;
  artifact: QrArtifact;
  scannedAt: string;
}

const API_URL = '/api/qr-guides';

export const qrGuideService = {
  // Get an artifact by ID
  getArtifact: async (id: string): Promise<QrArtifact> => {
    return get<QrArtifact>(`${API_URL}/${id}`, true);
  },

  // Record that a user scanned an artifact
  recordScan: async (id: string): Promise<ScanHistory> => {
    return post<ScanHistory>(`${API_URL}/${id}/scan`, {}, true);
  },

  // Get current user's scan history
  getUserHistory: async (): Promise<ScanHistory[]> => {
    return get<ScanHistory[]>(`${API_URL}/history`, true);
  },

  // Admin: create a new artifact
  createArtifact: async (data: Partial<QrArtifact>): Promise<QrArtifact> => {
    return post<QrArtifact>(API_URL, data, true);
  },

  // Admin: get all artifacts
  getAllArtifacts: async (): Promise<QrArtifact[]> => {
    return get<QrArtifact[]>(API_URL, true);
  }
};

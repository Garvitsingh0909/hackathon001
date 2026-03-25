export interface WaterQualityReport {
    id: string;
    userId?: string;
    location: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'Safe' | 'Moderate' | 'Unsafe';
    imageUrl?: string;
    analysis?: {
        score: number;
        status: string;
    };
    createdAt: string;
    lat?: number;
    lng?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    isThinking?: boolean;
}

export interface RiverSegment {
    id: string;
    name: string;
    status: 'Safe' | 'Warning' | 'Critical';
    lastUpdate: string;
    coordinates: { lat: number; lng: number };
    paramDo: number; // Dissolved Oxygen
    paramPh: number;
}

export interface GroundingMetadata {
    webSearchQueries?: string[];
    groundingChunks?: any[];
}
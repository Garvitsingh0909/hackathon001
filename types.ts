export interface WaterQualityReport {
    id: string;
    locationName: string;
    coordinates: { lat: number; lng: number };
    algaeLevel: 'None' | 'Low' | 'Moderate' | 'High' | 'Critical';
    foamDetected: boolean;
    turbidity: 'Clear' | 'Slightly Cloudy' | 'Cloudy' | 'Opaque';
    overallScore: number;
    recommendation: string;
    details: string;
    timestamp: string;
    status: 'Pending' | 'In Review' | 'Action Taken' | 'Resolved';
    imageUrl?: string;
    color?: string;
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
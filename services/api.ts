// This service simulates a backend API + Database
import { WaterQualityReport, RiverSegment } from '../types';

// Initial "Database" State
const MOCK_SEGMENTS: RiverSegment[] = [
    { id: 'seg-1', name: 'Tamsa Headwaters (Mau)', status: 'Safe', lastUpdate: '10 mins ago', coordinates: { lat: 25.9427, lng: 83.5539 }, paramDo: 6.8, paramPh: 7.2 },
    { id: 'seg-2', name: 'Industrial Zone A', status: 'Critical', lastUpdate: '2 mins ago', coordinates: { lat: 25.9500, lng: 83.5600 }, paramDo: 3.2, paramPh: 8.4 },
    { id: 'seg-3', name: 'Agricultural Runoff Point', status: 'Warning', lastUpdate: '1 hour ago', coordinates: { lat: 25.9300, lng: 83.5400 }, paramDo: 5.1, paramPh: 7.8 },
    { id: 'seg-4', name: 'City Center Ghat', status: 'Critical', lastUpdate: 'Just now', coordinates: { lat: 25.9450, lng: 83.5500 }, paramDo: 2.9, paramPh: 8.1 },
];

let REPORTS_DB: WaterQualityReport[] = [
    {
        id: 'rpt-102',
        locationName: 'City Center Ghat',
        coordinates: { lat: 25.9450, lng: 83.5500 },
        algaeLevel: 'High',
        foamDetected: true,
        turbidity: 'Opaque',
        overallScore: 35,
        recommendation: 'Immediate halt of discharge required.',
        details: 'Visual analysis confirms heavy algal bloom and industrial foaming.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        status: 'In Review'
    },
    {
        id: 'rpt-101',
        locationName: 'Tamsa Headwaters',
        coordinates: { lat: 25.9427, lng: 83.5539 },
        algaeLevel: 'None',
        foamDetected: false,
        turbidity: 'Clear',
        overallScore: 92,
        recommendation: 'Maintain current protection protocols.',
        details: 'Water appears clear with healthy ecosystem indicators.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        status: 'Resolved'
    },
    {
        id: 'rpt-100',
        locationName: 'Industrial Zone A',
        coordinates: { lat: 25.9500, lng: 83.5600 },
        algaeLevel: 'Moderate',
        foamDetected: true,
        turbidity: 'Cloudy',
        overallScore: 58,
        recommendation: 'Increase sampling frequency.',
        details: 'Minor foaming observed near outlet.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        status: 'Action Taken'
    }
];

// API Methods
export const api = {
    // Get all river segments (for Admin Map)
    getSegments: async (): Promise<RiverSegment[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_SEGMENTS]), 600));
    },

    // Get recent reports (for Dashboard)
    getReports: async (): Promise<WaterQualityReport[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...REPORTS_DB].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())), 800));
    },

    // Get trend data for charts (Simulated aggregation)
    getWaterTrends: async (): Promise<{name: string, value: number}[]> => {
        // Simulating a 7-day trend based on DB data + some randomization for the graph shape
        return new Promise(resolve => {
            setTimeout(() => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const data = days.map(day => ({
                    name: day,
                    value: Math.floor(Math.random() * (75 - 45 + 1) + 45) // Random realistic values between 45 and 75
                }));
                resolve(data);
            }, 600);
        });
    },

    // Submit a new analysis report
    submitReport: async (report: Omit<WaterQualityReport, 'id' | 'timestamp' | 'status'>): Promise<WaterQualityReport> => {
        const newReport: WaterQualityReport = {
            ...report,
            id: `rpt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'Pending'
        };
        REPORTS_DB.unshift(newReport);
        
        // Update segment status if matches (Simulating trigger)
        const segmentIndex = MOCK_SEGMENTS.findIndex(s => s.name === report.locationName);
        if (segmentIndex >= 0) {
            if (report.overallScore < 50) MOCK_SEGMENTS[segmentIndex].status = 'Critical';
            else if (report.overallScore < 75) MOCK_SEGMENTS[segmentIndex].status = 'Warning';
            else MOCK_SEGMENTS[segmentIndex].status = 'Safe';
        }

        return new Promise(resolve => setTimeout(() => resolve(newReport), 1000));
    }
};
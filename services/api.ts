import { WaterQualityReport, RiverSegment } from '../types';

export const api = {
    getSegments: async (): Promise<RiverSegment[]> => {
        const res = await fetch('/api/segments');
        if (!res.ok) throw new Error('Failed to fetch segments');
        return res.json();
    },

    getReports: async (): Promise<WaterQualityReport[]> => {
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
    },

    getWaterTrends: async (): Promise<{name: string, value: number}[]> => {
        const res = await fetch('/api/trends');
        if (!res.ok) throw new Error('Failed to fetch trends');
        return res.json();
    },

    submitReport: async (report: Omit<WaterQualityReport, 'id' | 'timestamp' | 'status'>): Promise<WaterQualityReport> => {
        const res = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
        if (!res.ok) throw new Error('Failed to submit report');
        return res.json();
    }
};
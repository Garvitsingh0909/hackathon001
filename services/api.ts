import { WaterQualityReport, RiverSegment } from '../types';
import { db } from '../src/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

const MOCK_SEGMENTS = [
    { id: 'seg-1', name: 'Tamsa Headwaters (Mau)', status: 'Safe', lastUpdate: '10 mins ago', coordinates: { lat: 25.9427, lng: 83.5539 }, paramDo: 6.8, paramPh: 7.2 },
    { id: 'seg-2', name: 'Industrial Zone A', status: 'Critical', lastUpdate: '2 mins ago', coordinates: { lat: 25.9500, lng: 83.5600 }, paramDo: 3.2, paramPh: 8.4 },
    { id: 'seg-3', name: 'Agricultural Runoff Point', status: 'Warning', lastUpdate: '1 hour ago', coordinates: { lat: 25.9300, lng: 83.5400 }, paramDo: 5.1, paramPh: 7.8 },
    { id: 'seg-4', name: 'City Center Ghat', status: 'Critical', lastUpdate: 'Just now', coordinates: { lat: 25.9450, lng: 83.5500 }, paramDo: 2.9, paramPh: 8.1 },
];

export const api = {
    getSegments: async (): Promise<RiverSegment[]> => {
        return MOCK_SEGMENTS as any;
    },

    getReports: async (): Promise<WaterQualityReport[]> => {
        try {
            const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(10));
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                } as WaterQualityReport;
            });
            
            if (reports.length > 0) return reports;
        } catch (e) {
            console.error("Error fetching reports from Firestore:", e);
        }
        
        // Fallback mock data if Firestore is empty or fails
        return [
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
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                status: 'In Review'
            } as any
        ];
    },

    getWaterTrends: async (): Promise<{name: string, value: number}[]> => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            name: day,
            value: Math.floor(Math.random() * (75 - 45 + 1) + 45)
        }));
    },

    submitReport: async (report: Omit<WaterQualityReport, 'id' | 'timestamp' | 'status'>): Promise<WaterQualityReport> => {
        try {
            const docRef = await addDoc(collection(db, 'reports'), {
                ...report,
                createdAt: serverTimestamp(),
                status: 'Pending'
            });
            return {
                ...report,
                id: docRef.id,
                timestamp: new Date().toISOString(),
                status: 'Pending'
            } as WaterQualityReport;
        } catch (e) {
            console.error("Error submitting report to Firestore:", e);
            throw e;
        }
    }
};
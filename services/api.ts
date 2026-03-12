import { WaterQualityReport, RiverSegment } from '../types';
import { db } from '../src/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export const api = {
    getSegments: async (): Promise<RiverSegment[]> => {
        // For now, keeping segments as mock data as they seem static
        return [
            { id: 'seg-1', name: 'Tamsa Headwaters (Mau)', status: 'Safe', lastUpdate: '10 mins ago', coordinates: { lat: 25.9427, lng: 83.5539 }, paramDo: 6.8, paramPh: 7.2 },
            { id: 'seg-2', name: 'Industrial Zone A', status: 'Critical', lastUpdate: '2 mins ago', coordinates: { lat: 25.9500, lng: 83.5600 }, paramDo: 3.2, paramPh: 8.4 },
            { id: 'seg-3', name: 'Agricultural Runoff Point', status: 'Warning', lastUpdate: '1 hour ago', coordinates: { lat: 25.9300, lng: 83.5400 }, paramDo: 5.1, paramPh: 7.8 },
            { id: 'seg-4', name: 'City Center Ghat', status: 'Critical', lastUpdate: 'Just now', coordinates: { lat: 25.9450, lng: 83.5500 }, paramDo: 2.9, paramPh: 8.1 },
        ] as any;
    },

    getReports: async (): Promise<WaterQualityReport[]> => {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<WaterQualityReport, 'id'>),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        })) as WaterQualityReport[];
    },

    getWaterTrends: async (): Promise<{name: string, value: number}[]> => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            name: day,
            value: Math.floor(Math.random() * (75 - 45 + 1) + 45)
        }));
    },

    submitReport: async (report: Omit<WaterQualityReport, 'id' | 'timestamp' | 'status'>): Promise<WaterQualityReport> => {
        const reportData = {
            ...report,
            createdAt: serverTimestamp(),
            status: 'Pending'
        };
        const docRef = await addDoc(collection(db, 'reports'), reportData);
        return {
            ...report,
            id: docRef.id,
            timestamp: new Date().toISOString(),
            status: 'Pending'
        } as WaterQualityReport;
    },

    getUsers: async (): Promise<any[]> => {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role });
    }
};
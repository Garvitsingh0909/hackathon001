import { WaterQualityReport, RiverSegment } from '../types';
import { db, auth } from '../src/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const getSegments = async (): Promise<RiverSegment[]> => {
    // For now, keeping segments as mock data as they seem static
    return [
        { id: 'seg-1', name: 'Tamsa Headwaters (Mau)', status: 'Safe', lastUpdate: '10 mins ago', coordinates: { lat: 25.9427, lng: 83.5539 }, paramDo: 6.8, paramPh: 7.2 },
        { id: 'seg-2', name: 'Industrial Zone A', status: 'Critical', lastUpdate: '2 mins ago', coordinates: { lat: 25.9500, lng: 83.5600 }, paramDo: 3.2, paramPh: 8.4 },
        { id: 'seg-3', name: 'Agricultural Runoff Point', status: 'Warning', lastUpdate: '1 hour ago', coordinates: { lat: 25.9300, lng: 83.5400 }, paramDo: 5.1, paramPh: 7.8 },
        { id: 'seg-4', name: 'City Center Ghat', status: 'Critical', lastUpdate: 'Just now', coordinates: { lat: 25.9450, lng: 83.5500 }, paramDo: 2.9, paramPh: 8.1 },
    ] as any;
};

export const getReports = async (): Promise<WaterQualityReport[]> => {
    if (!auth.currentUser) {
        return [];
    }
    try {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<WaterQualityReport, 'id'>),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        })) as WaterQualityReport[];
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'reports');
        return [];
    }
};

export const getTrends = async (): Promise<{name: string, value: number}[]> => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        name: day,
        value: Math.floor(Math.random() * (75 - 45 + 1) + 45)
    }));
};

export const submitReport = async (report: Omit<WaterQualityReport, 'id' | 'timestamp' | 'status'>): Promise<WaterQualityReport> => {
    if (!auth.currentUser) {
        throw new Error('Must be logged in to submit a report');
    }
    try {
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
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'reports');
        throw error;
    }
};

export const getUsers = async (): Promise<any[]> => {
    if (!auth.currentUser) {
        return [];
    }
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
        return [];
    }
};

export const getFeedback = async (): Promise<any[]> => {
    try {
        const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'feedback');
        return [];
    }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        throw error;
    }
};

export const getWeather = async (lat: number, lng: number): Promise<any> => {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error('Weather fetch failed');
        return await response.json();
    } catch (error) {
        console.error('getWeather error:', error);
        return null;
    }
};

export const api = {
    getSegments,
    getReports,
    getWaterTrends: getTrends,
    submitReport,
    getUsers,
    getFeedback,
    updateUserRole,
    getWeather
};
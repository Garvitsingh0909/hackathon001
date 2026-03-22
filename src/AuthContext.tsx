import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'user' | 'admin';
    createdAt: string;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: Initializing onAuthStateChanged");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("AuthContext: Auth state changed", firebaseUser?.uid);
            setLoading(true);
            try {
                if (firebaseUser) {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    console.log("AuthContext: Fetching user profile for", firebaseUser.uid);
                    
                    let userSnap;
                    let retries = 0;
                    const maxRetries = 3;
                    
                    while (retries < maxRetries) {
                        try {
                            userSnap = await getDoc(userRef);
                            break;
                        } catch (error) {
                            retries++;
                            console.warn(`AuthContext: Failed to fetch user profile, retry ${retries}/${maxRetries}`);
                            if (retries >= maxRetries) throw error;
                            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                        }
                    }

                    if (userSnap && userSnap.exists()) {
                        console.log("AuthContext: User profile found");
                        const data = userSnap.data();
                        setUser({
                            ...data,
                            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
                        } as UserProfile);
                    } else if (userSnap) {
                        console.log("AuthContext: No user profile found, creating one...");
                        const newUser: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || '',
                            photoURL: firebaseUser.photoURL || '',
                            role: 'user',
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userRef, {
                            ...newUser,
                            createdAt: serverTimestamp()
                        });
                        console.log("AuthContext: User profile created");
                        setUser(newUser);
                    }
                } else {
                    console.log("AuthContext: No firebase user");
                    setUser(null);
                }
            } catch (error) {
                console.error("AuthContext: Error in auth state change:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                console.warn("Login popup was closed by user.");
            } else {
                console.error("Login failed:", error);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' || user?.email === 'devansh0547@gmail.com' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface HistoryItem {
  id: string;
  userId: string;
  originalFile: string;
  protectedFile: string;
  fileType: string;
  protectionStrength: number;
  noiseSignature: string;
  createdAt: any;
}

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, 'protected_assets'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const items: HistoryItem[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as HistoryItem);
          });
          setHistory(items);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching history:", error);
          setLoading(false);
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setHistory([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  return { history, loading };
};

export const addHistory = async (item: Omit<HistoryItem, 'id' | 'userId' | 'createdAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await addDoc(collection(db, 'protected_assets'), {
      ...item,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to save history to Firestore", e);
  }
};

export interface SettingsConfig {
  defaultNoiseIntensity: number;
  enableAiTrapMode: boolean;
}

export const getSettings = (): SettingsConfig => {
  try {
    const data = localStorage.getItem('neuroglaze_settings');
    return data ? JSON.parse(data) : { defaultNoiseIntensity: 50, enableAiTrapMode: true };
  } catch (e) {
    return { defaultNoiseIntensity: 50, enableAiTrapMode: true };
  }
};

export const saveSettings = (settings: SettingsConfig) => {
  try {
    localStorage.setItem('neuroglaze_settings', JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

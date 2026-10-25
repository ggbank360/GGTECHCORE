// Review Service — Customer Reviews & Ratings with Firestore and localStorage Fallback Cache
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  toISOStringSafe
} from './firebase';

const LOCAL_STORAGE_REVIEWS_KEY = 'gg_techcore_reviews_v1';

export const initialReviews = [
  {
    id: 'rev_01',
    name: 'Dr. Vikram Raman',
    role: 'Head of Biomedical Engineering',
    organization: 'Apex Healthtech Research',
    projectTitle: 'Smart Hospital Infusion & IV Monitoring System',
    rating: 5,
    comment: 'GG TECHCORE delivered a stellar ESP32 telemetry prototype for our clinical trials. Their strain-gauge calibration and non-contact optical sensor achieved sub-2% flow rate error. Excellent documentation and fast engineering support.',
    createdAt: '2026-10-14T11:30:00.000Z'
  },
  {
    id: 'rev_02',
    name: 'Ananya Sharma',
    role: 'Robotics Team Lead',
    organization: 'Kinetics Autonomous Labs',
    projectTitle: 'Autonomous LiDAR AGV & Warehouse Rover',
    rating: 5,
    comment: 'The STM32 CAN-bus motor drive and ROS2 SLAM stack engineered by GG TECHCORE worked seamlessly out of the box. The waypoint localization accuracy is within 2cm on our warehouse floor. Highly recommended for complex robotics projects.',
    createdAt: '2026-10-18T14:45:00.000Z'
  },
  {
    id: 'rev_03',
    name: 'Karthik Narayanan',
    role: 'Principal Hardware Engineer',
    organization: 'AeroGrid Energy Systems',
    projectTitle: 'High-Density 4-Layer Motor Drive & BLDC Controller PCB',
    rating: 5,
    comment: 'Outstanding PCB layout work with ultra-low trace inductance and thermal via matrices. Handled 45A continuous motor load without thermal throttling. The Gerber files and BOM were 100% turnkey for manufacturing.',
    createdAt: '2026-10-21T09:15:00.000Z'
  },
  {
    id: 'rev_04',
    name: 'Prof. Suresh Mehta',
    role: 'Department of Electronics',
    organization: 'National Institute of Technology',
    projectTitle: 'Industrial LoRaWAN Environmental Telemetry Node',
    rating: 5,
    comment: 'Their edge FFT vibration algorithms on STM32L4 exceeded our expectations. Achieved 11km transmission range in noisy industrial RF conditions with true micro-amp deep sleep power consumption.',
    createdAt: '2026-10-23T16:20:00.000Z'
  }
];

export const getLocalReviews = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(initialReviews));
      return initialReviews;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(initialReviews));
      return initialReviews;
    }
    return parsed;
  } catch {
    return initialReviews;
  }
};

export const saveLocalReviews = (reviews) => {
  try {
    const dataToSave = Array.isArray(reviews) && reviews.length > 0 ? reviews : initialReviews;
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('gg_reviews_updated', { detail: dataToSave }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'REVIEWS_UPDATED', data: dataToSave });
        bc.close();
      } catch {
        // Optional multi-tab sync
      }
    }
  } catch (err) {
    console.error('Error saving reviews to localStorage:', err);
  }
};

/**
 * Real-time subscription for customer reviews (Firestore primary with localStorage fallback)
 */
export const subscribeToReviews = (callback) => {
  const initial = getLocalReviews();
  callback(initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      unsubscribeFirestore = onSnapshot(revRef, (snapshot) => {
        if (snapshot.empty || snapshot.docs.length === 0) {
          const local = getLocalReviews();
          callback(local);
          return;
        }

        const list = snapshot.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data, createdAt: toISOStringSafe(data.createdAt) };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveLocalReviews(list);
        callback(list);
      }, (err) => {
        console.warn('Firestore reviews onSnapshot notice, using local cache:', err?.code || 'unknown', err?.message);
        callback(getLocalReviews());
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for reviews, using local cache:', e?.code || 'unknown', e?.message);
      callback(getLocalReviews());
    }
  } else {
    callback(getLocalReviews());
  }

  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
    else callback(getLocalReviews());
  };
  window.addEventListener('gg_reviews_updated', handleLocalUpdate);

  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('gg_techcore_sync');
      bc.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'REVIEWS_UPDATED') {
          callback(msg.data.data);
        }
      };
    } catch {
      // Ignore broadcast errors
    }
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_reviews_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

/**
 * Get all verified reviews from Firestore first with localStorage fallback
 */
export const getAllReviews = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const snapshot = await getDocs(revRef);
      if (snapshot.empty || snapshot.docs.length === 0) {
        return getLocalReviews();
      }
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: toISOStringSafe(data.createdAt) };
      });
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveLocalReviews(list);
      return list;
    } catch (e) {
      console.warn('Firestore getAllReviews notice, using local cache:', e?.code || 'unknown', e?.message);
      return getLocalReviews();
    }
  }

  return getLocalReviews();
};

/**
 * Submit verified review
 * Persists immediately to localStorage fallback cache and attempts Firestore cloud sync.
 */
export const submitReview = async (reviewData) => {
  if (!reviewData.name?.trim()) throw new Error('Name is required.');
  if (!reviewData.comment?.trim()) throw new Error('Review comment is required.');

  const newId = reviewData.id || `rev_${Date.now()}`;
  const payload = {
    id: newId,
    name: reviewData.name.trim(),
    role: reviewData.role?.trim() || 'Engineering Client',
    organization: reviewData.organization?.trim() || '',
    projectTitle: reviewData.projectTitle?.trim() || 'Custom Engineering Project',
    rating: Number(reviewData.rating) || 5,
    comment: reviewData.comment.trim(),
    createdAt: reviewData.createdAt || new Date().toISOString()
  };

  // 1. Immediate local persistence & event dispatch so website renders immediately
  const local = getLocalReviews().filter(r => r.id !== newId);
  local.unshift(payload);
  saveLocalReviews(local);

  let firestoreError = null;
  let synced = false;

  // 2. Cloud sync to Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const docRef = doc(revRef, newId);
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      synced = true;
      console.info(`Review created in Firestore with ID: ${newId}`);
    } catch (err) {
      firestoreError = err?.message || 'Firestore cloud write failed';
      console.warn('Firestore submitReview notice (persisted in local fallback):', firestoreError);
    }
  }

  return { ...payload, synced, firestoreError };
};

/**
 * Delete review (Admin only)
 * Persists immediately to localStorage fallback cache and attempts Firestore cloud sync.
 */
export const deleteReview = async (id) => {
  const filtered = getLocalReviews().filter(r => r.id !== id);
  saveLocalReviews(filtered);

  let firestoreError = null;
  let synced = false;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'reviews', id);
      await deleteDoc(docRef);
      synced = true;
      console.info(`Review ${id} deleted from Firestore.`);
    } catch (err) {
      firestoreError = err?.message || 'Firestore cloud delete failed';
      console.warn('Firestore deleteReview notice (removed from local fallback):', firestoreError);
    }
  }

  return { success: true, synced, firestoreError };
};

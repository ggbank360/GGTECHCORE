// Review Service — Customer Reviews & Ratings with Firestore primary persistence
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp
} from './firebase';

const LOCAL_STORAGE_REVIEWS_KEY = 'gg_techcore_reviews_v1';

const initialReviews = [
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
    projectTitle: 'Industrial LoRaWAN Environmental Node',
    rating: 5,
    comment: 'Their edge FFT vibration algorithms on STM32L4 exceeded our expectations. Achieved 11km transmission range in noisy industrial RF conditions with true micro-amp deep sleep power consumption.',
    createdAt: '2026-10-23T16:20:00.000Z'
  }
];

export const getLocalReviews = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) {
      return initialReviews;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialReviews;
  } catch {
    return initialReviews;
  }
};

export const saveLocalReviews = (reviews) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('gg_reviews_updated', { detail: reviews }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'REVIEWS_UPDATED', data: reviews });
        bc.close();
      } catch {
        // Optional multi-tab sync
      }
    }
  } catch (err) {
    console.error('Error saving reviews:', err);
  }
};

/**
 * Real-time subscription for customer reviews (Firestore primary)
 */
export const subscribeToReviews = (callback) => {
  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      unsubscribeFirestore = onSnapshot(revRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveLocalReviews(list);
        callback(list);
      }, (err) => {
        console.error('Firestore reviews onSnapshot error with code:', err?.code || 'unknown', err);
        callback(getLocalReviews());
      });
    } catch (e) {
      console.error('Could not attach Firestore onSnapshot for reviews with code:', e?.code || 'unknown', e);
      callback(getLocalReviews());
    }
  } else {
    console.error('Firebase is not configured. Falling back to localStorage for reviews.');
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
 * Get all verified reviews from Firestore first
 */
export const getAllReviews = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const snapshot = await getDocs(revRef);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveLocalReviews(list);
      return list;
    } catch (e) {
      console.error('Firestore getAllReviews failed with code:', e?.code || 'unknown', e);
      return getLocalReviews();
    }
  }

  console.error('Firebase is not configured. Falling back to localStorage for getAllReviews.');
  return getLocalReviews();
};

/**
 * Submit verified review to Firestore first
 */
export const submitReview = async (reviewData) => {
  if (!reviewData.name?.trim()) throw new Error('Name is required.');
  if (!reviewData.comment?.trim()) throw new Error('Review comment is required.');

  const payload = {
    name: reviewData.name.trim(),
    role: reviewData.role?.trim() || 'Engineering Client',
    organization: reviewData.organization?.trim() || '',
    projectTitle: reviewData.projectTitle?.trim() || 'Custom Engineering Project',
    rating: Number(reviewData.rating) || 5,
    comment: reviewData.comment.trim(),
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const docRef = await addDoc(revRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      const createdRecord = { id: docRef.id, ...payload };
      
      const local = getLocalReviews().filter(r => r.id !== docRef.id);
      local.unshift(createdRecord);
      saveLocalReviews(local);
      console.info(`Review created in Firestore with ID: ${docRef.id}`);
      return createdRecord;
    } catch (err) {
      console.error('Firestore submitReview failed with code:', err?.code || 'unknown', err);
      throw err;
    }
  }

  console.error('Firebase is not configured. Saving review to localStorage fallback.');
  const newId = `rev_${Date.now()}`;
  const fullRecord = { id: newId, ...payload };
  const local = getLocalReviews();
  local.unshift(fullRecord);
  saveLocalReviews(local);
  return fullRecord;
};

/**
 * Delete review in Firestore first (Admin only)
 */
export const deleteReview = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'reviews', id);
      await deleteDoc(docRef);
      const filtered = getLocalReviews().filter(r => r.id !== id);
      saveLocalReviews(filtered);
      console.info(`Review ${id} deleted from Firestore.`);
      return true;
    } catch (err) {
      console.error('Firestore deleteReview failed with code:', err?.code || 'unknown', err);
      throw err;
    }
  }

  console.error('Firebase is not configured. Deleting review from localStorage fallback.');
  const filtered = getLocalReviews().filter(r => r.id !== id);
  saveLocalReviews(filtered);
  return true;
};

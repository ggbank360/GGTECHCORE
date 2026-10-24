// Review Service — Customer Reviews & Ratings
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
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
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(initialReviews));
      return initialReviews;
    }
    return JSON.parse(raw);
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
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving reviews:', err);
  }
};

/**
 * Real-time subscription for customer reviews
 */
export const subscribeToReviews = (callback) => {
  const initial = getLocalReviews();
  callback(initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const q = query(revRef, orderBy('createdAt', 'desc'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore reviews onSnapshot note:', err.message);
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for reviews:', e.message);
    }
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
    } catch (e) {}
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_reviews_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

export const getAllReviews = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      const q = query(revRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        saveLocalReviews(list);
        return list;
      }
    } catch (e) {
      console.warn('Firestore reviews fetch note:', e.message);
    }
  }
  return getLocalReviews();
};

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

  const newId = `rev_${Date.now()}`;
  const fullRecord = { id: newId, ...payload };

  const local = getLocalReviews();
  local.unshift(fullRecord);
  saveLocalReviews(local);

  if (isFirebaseConfigured() && db) {
    try {
      const revRef = collection(db, 'reviews');
      await addDoc(revRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore review save note:', err.message);
    }
  }

  return fullRecord;
};

export const deleteReview = async (id) => {
  const local = getLocalReviews();
  const filtered = local.filter(r => r.id !== id);
  saveLocalReviews(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'reviews', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore review delete note:', err.message);
    }
  }
  return true;
};

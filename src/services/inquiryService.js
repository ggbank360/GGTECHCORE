// Inquiry Service — Contact Form Inquiries with Firestore primary persistence
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  toISOStringSafe
} from './firebase';

const LOCAL_STORAGE_INQUIRIES_KEY = 'gg_techcore_inquiries_v1';

const sampleInquiries = [
  {
    id: "inq_01",
    name: "Dr. K. Srinivas",
    email: "srinivas.k@techuniversity.edu",
    phone: "+91 94432 10987",
    subject: "Industrial IoT Lab Setup Consultation",
    message: "We would like to consult with GG TECHCORE regarding setting up an advanced Embedded Systems and IoT prototyping lab for our engineering faculty.",
    createdAt: "2026-10-20T10:15:00.000Z"
  }
];

export const getLocalInquiries = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
    if (!raw) {
      return sampleInquiries;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : sampleInquiries;
  } catch (err) {
    console.error('Error reading inquiries from localStorage:', err);
    return sampleInquiries;
  }
};

export const saveLocalInquiries = (inquiries) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(inquiries));
    window.dispatchEvent(new CustomEvent('gg_inquiries_updated', { detail: inquiries }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'INQUIRIES_UPDATED', data: inquiries });
        bc.close();
      } catch {
        // Optional multi-tab sync
      }
    }
  } catch (err) {
    console.error('Error saving inquiries to localStorage:', err);
  }
};

/**
 * Real-time subscription for inquiries (Firestore primary)
 */
export const subscribeToInquiries = (callback) => {
  const initial = getLocalInquiries();
  callback(initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      unsubscribeFirestore = onSnapshot(inqRef, (snapshot) => {
        const list = snapshot.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data, createdAt: toISOStringSafe(data.createdAt) };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveLocalInquiries(list);
        callback(list);
      }, (err) => {
        console.error('Firestore inquiries onSnapshot error with code:', err?.code || 'unknown', err);
        callback(getLocalInquiries());
      });
    } catch (e) {
      console.error('Could not attach Firestore onSnapshot for inquiries with code:', e?.code || 'unknown', e);
      callback(getLocalInquiries());
    }
  } else {
    console.error('Firebase is not configured. Falling back to localStorage for inquiries.');
    callback(getLocalInquiries());
  }

  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
    else callback(getLocalInquiries());
  };
  window.addEventListener('gg_inquiries_updated', handleLocalUpdate);

  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('gg_techcore_sync');
      bc.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'INQUIRIES_UPDATED') {
          callback(msg.data.data);
        }
      };
    } catch {
      // Ignore broadcast errors
    }
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_inquiries_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

/**
 * Submit contact inquiry to Firestore first
 */
export const submitInquiry = async (inquiryData) => {
  if (!inquiryData.name || !inquiryData.name.trim()) {
    throw new Error('Name is required.');
  }
  if (!inquiryData.email || !inquiryData.email.trim()) {
    throw new Error('Email is required.');
  }
  if (!inquiryData.message || !inquiryData.message.trim()) {
    throw new Error('Message is required.');
  }

  const payload = {
    name: inquiryData.name.trim(),
    email: inquiryData.email.trim().toLowerCase(),
    phone: inquiryData.phone?.trim() || '',
    subject: inquiryData.subject?.trim() || 'General Inquiry',
    message: inquiryData.message.trim(),
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      const docRef = await addDoc(inqRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      const createdRecord = { id: docRef.id, ...payload };
      
      const local = getLocalInquiries().filter(i => i.id !== docRef.id);
      local.unshift(createdRecord);
      saveLocalInquiries(local);
      console.info(`Inquiry created in Firestore with ID: ${docRef.id}`);
      return createdRecord;
    } catch (error) {
      console.error('Firestore submitInquiry failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Saving inquiry to localStorage fallback.');
  const fallbackRecord = {
    ...payload,
    id: `inq_${Date.now()}`
  };
  const local = getLocalInquiries();
  local.unshift(fallbackRecord);
  saveLocalInquiries(local);
  return fallbackRecord;
};

/**
 * Get all contact inquiries from Firestore first (Admin only)
 */
export const getAllInquiries = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      const snapshot = await getDocs(inqRef);
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: toISOStringSafe(data.createdAt) };
      });
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveLocalInquiries(list);
      return list;
    } catch (error) {
      console.error('Firestore getAllInquiries failed with code:', error?.code || 'unknown', error);
      return getLocalInquiries();
    }
  }

  console.error('Firebase is not configured. Falling back to localStorage for getAllInquiries.');
  return getLocalInquiries();
};

/**
 * Delete inquiry in Firestore first (Admin only)
 */
export const deleteInquiry = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'inquiries', id);
      await deleteDoc(docRef);
      const filtered = getLocalInquiries().filter(i => i.id !== id);
      saveLocalInquiries(filtered);
      console.info(`Inquiry ${id} deleted from Firestore.`);
      return true;
    } catch (error) {
      console.error('Firestore deleteInquiry failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Deleting inquiry from localStorage fallback.');
  const filtered = getLocalInquiries().filter(i => i.id !== id);
  saveLocalInquiries(filtered);
  return true;
};

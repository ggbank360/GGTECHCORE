// Inquiry Service — Contact Form Inquiries
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  isPermissionDenied
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

const getLocalInquiries = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(sampleInquiries));
      return sampleInquiries;
    }
    return JSON.parse(raw);
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
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving inquiries to localStorage:', err);
  }
};

/**
 * Real-time subscription for inquiries
 */
export const subscribeToInquiries = (callback) => {
  const initial = getLocalInquiries();
  callback(initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      const q = query(inqRef, orderBy('createdAt', 'desc'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(list));
          callback(list);
        }
      }, (err) => {
        if (!isPermissionDenied(err)) {
          console.warn('Firestore inquiries onSnapshot note:', err.message);
        }
      });
    } catch (e) {
      if (!isPermissionDenied(e)) {
        console.warn('Could not attach Firestore onSnapshot for inquiries:', e.message);
      }
    }
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
    } catch (e) {}
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_inquiries_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

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

  let createdRecord = null;
  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      const docRef = await addDoc(inqRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      createdRecord = { id: docRef.id, ...payload };
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.warn('Failed to submit inquiry to Firestore:', error);
      }
    }
  }

  const local = getLocalInquiries();
  const finalInq = createdRecord || {
    ...payload,
    id: `inq_${Date.now()}`
  };
  local.unshift(finalInq);
  saveLocalInquiries(local);
  return finalInq;
};

export const getAllInquiries = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const inqRef = collection(db, 'inquiries');
      const q = query(inqRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.warn('Firestore inquiries query failed, reading local store:', error);
      }
    }
  }

  return getLocalInquiries();
};

// Project Service — Firestore Integration with Instant Real-Time Synchronization
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from './firebase';
import { initialProjects } from '../data/seedProjects';

const LOCAL_STORAGE_KEY = 'gg_techcore_projects_v2';
const MOCK_PROJECT_IDS = ['proj_esp32_smart_iv', 'proj_lidar_agv_rover', 'proj_bldc_pcb_controller'];

// Initialize local storage cache - empty and cleared of default sample projects
export const getLocalProjects = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    const cleaned = parsed.filter(p => !MOCK_PROJECT_IDS.includes(p.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Error reading projects from localStorage:', err);
    return [];
  }
};

export const saveLocalProjects = (projects) => {
  try {
    const cleaned = projects.filter(p => !MOCK_PROJECT_IDS.includes(p.id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('gg_projects_updated', { detail: cleaned }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'PROJECTS_UPDATED', data: cleaned });
        bc.close();
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

/**
 * Real-time subscription for projects (Firestore onSnapshot + Local events + BroadcastChannel)
 */
export const subscribeToProjects = (callback) => {
  // 1. Initial call with local data
  const initial = getLocalProjects();
  callback(initial);

  let unsubscribeFirestore = null;

  // 2. Firestore real-time listener if configured
  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => !MOCK_PROJECT_IDS.includes(p.id));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback([]);
        }
      }, (err) => {
        console.warn('Firestore onSnapshot project listener note:', err.message);
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for projects:', e.message);
    }
  }

  // 3. Local custom event listener
  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
    else callback(getLocalProjects());
  };
  window.addEventListener('gg_projects_updated', handleLocalUpdate);

  // 4. BroadcastChannel listener for multi-tab sync
  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('gg_techcore_sync');
      bc.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'PROJECTS_UPDATED') {
          callback(msg.data.data);
        }
      };
    } catch (e) {}
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_projects_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

/**
 * Fetch all projects (optionally filtering for published only)
 * @param {boolean} publishedOnly - If true, returns only published projects
 */
export const getAllProjects = async (publishedOnly = true) => {
  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      let q = query(projectsRef, orderBy('createdAt', 'desc'));
      if (publishedOnly) {
        q = query(projectsRef, where('published', '==', true));
      }
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => !MOCK_PROJECT_IDS.includes(p.id));
      
      if (list.length > 0) {
        // Keep local cache synced with latest Firestore data
        if (!publishedOnly) saveLocalProjects(list);
        return list;
      }
      
      const local = getLocalProjects();
      return publishedOnly ? local.filter(p => p.published) : local;
    } catch (error) {
      console.warn('Firestore fetch fallback to local cache:', error.message);
      const local = getLocalProjects();
      return publishedOnly ? local.filter(p => p.published) : local;
    }
  }

  const local = getLocalProjects();
  return publishedOnly ? local.filter(p => p.published) : local;
};

/**
 * Fetch single project by ID
 */
export const getProjectById = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('Firestore getDoc check:', err.message);
    }
  }

  const local = getLocalProjects();
  return local.find(p => p.id === id) || null;
};

/**
 * Check if Firebase Firestore is reachable and rules allow read/write
 */
export const checkFirestoreAccess = async () => {
  if (!isFirebaseConfigured() || !db) {
    return { ok: false, error: 'Firebase is not initialized or configured.' };
  }
  try {
    const projectsRef = collection(db, 'projects');
    await getDocs(query(projectsRef, orderBy('createdAt', 'desc')));
    return { ok: true };
  } catch (err) {
    return { 
      ok: false, 
      code: err.code || 'permission-denied', 
      message: err.message || 'Permission denied by Firestore rules.' 
    };
  }
};

/**
 * Upload all projects currently saved in local storage to Firestore
 */
export const syncAllLocalProjectsToFirestore = async () => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase Firestore is not configured.');
  }

  const local = getLocalProjects();
  if (local.length === 0) return 0;

  let successCount = 0;
  for (const proj of local) {
    const docRef = doc(db, 'projects', proj.id);
    await setDoc(docRef, {
      ...proj,
      updatedAt: serverTimestamp()
    }, { merge: true });
    successCount++;
  }

  return successCount;
};

/**
 * Create a new engineering project (Admin)
 */
export const createProject = async (projectData) => {
  const newId = `proj_${Date.now()}`;
  const payload = {
    ...projectData,
    id: newId,
    published: projectData.published ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Always update local cache and dispatch event for immediate UI update
  const local = getLocalProjects();
  local.unshift(payload);
  saveLocalProjects(local);

  let synced = false;
  let firestoreError = null;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', newId);
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      synced = true;
      console.info(`Project ${newId} saved to Firestore.`);
    } catch (error) {
      firestoreError = error.message;
      console.warn('Firestore project create sync notice:', error.message);
    }
  }

  return { ...payload, synced, firestoreError };
};

/**
 * Update an existing project (Admin)
 */
export const updateProject = async (id, updates) => {
  const payload = {
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };

  // Immediate local state update and event dispatch
  const local = getLocalProjects();
  const index = local.findIndex(p => p.id === id);
  let updatedRecord = null;
  if (index !== -1) {
    local[index] = { ...local[index], ...payload };
    updatedRecord = local[index];
  } else {
    updatedRecord = payload;
    local.unshift(updatedRecord);
  }
  saveLocalProjects(local);

  let synced = false;
  let firestoreError = null;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp()
      }, { merge: true });
      synced = true;
      console.info(`Project ${id} updated in Firestore.`);
    } catch (error) {
      firestoreError = error.message;
      console.warn('Firestore project update sync notice:', error.message);
    }
  }

  return { ...updatedRecord, synced, firestoreError };
};

/**
 * Delete a project (Admin)
 */
export const deleteProject = async (id) => {
  const local = getLocalProjects();
  const filtered = local.filter(p => p.id !== id);
  saveLocalProjects(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
      console.info(`Project ${id} deleted from Firestore.`);
    } catch (error) {
      console.warn('Firestore project delete sync notice:', error.message);
    }
  }

  return true;
};

/**
 * Seed all initial sample projects into Firestore (Admin utility)
 */
export const seedInitialProjectsToFirestore = async () => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase Firestore is not configured.');
  }

  let count = 0;
  for (const proj of initialProjects) {
    try {
      const docRef = doc(db, 'projects', proj.id);
      await setDoc(docRef, {
        ...proj,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      count++;
    } catch (e) {
      console.warn(`Seed failed for ${proj.id}:`, e.message);
    }
  }

  // Update local
  saveLocalProjects(initialProjects);
  return count;
};

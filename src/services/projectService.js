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
  onSnapshot,
  serverTimestamp
} from './firebase';
import { initialProjects } from '../data/seedProjects';

const LOCAL_STORAGE_KEY = 'gg_techcore_projects_v2';

// Local storage cache management
export const getLocalProjects = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading projects from localStorage:', err);
    return [];
  }
};

export const saveLocalProjects = (projects) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent('gg_projects_updated', { detail: projects }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'PROJECTS_UPDATED', data: projects });
        bc.close();
      } catch {
        // BroadcastChannel optional fallback
      }
    }
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

/**
 * Real-time subscription for projects (Firestore onSnapshot primary)
 * @param {function} callback
 * @param {boolean} publishedOnly - If true, queries only published projects
 */
export const subscribeToProjects = (callback, publishedOnly = false) => {
  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = publishedOnly 
        ? query(projectsRef, where('published', '==', true))
        : query(projectsRef);

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveLocalProjects(list);
        callback(list);
      }, (err) => {
        console.error('Firestore subscribeToProjects onSnapshot error with code:', err?.code || 'unknown', err);
        const local = getLocalProjects();
        callback(publishedOnly ? local.filter(p => p.published) : local);
      });
    } catch (e) {
      console.error('Could not attach Firestore onSnapshot for projects with code:', e?.code || 'unknown', e);
      const local = getLocalProjects();
      callback(publishedOnly ? local.filter(p => p.published) : local);
    }
  } else {
    console.error('Firebase is not configured. Falling back to localStorage for projects.');
    const local = getLocalProjects();
    callback(publishedOnly ? local.filter(p => p.published) : local);
  }

  // Local custom event listener for immediate same-window updates
  const handleLocalUpdate = (e) => {
    const data = e.detail || getLocalProjects();
    callback(publishedOnly ? data.filter(p => p.published) : data);
  };
  window.addEventListener('gg_projects_updated', handleLocalUpdate);

  // BroadcastChannel listener for multi-tab sync
  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('gg_techcore_sync');
      bc.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'PROJECTS_UPDATED') {
          const list = msg.data.data || [];
          callback(publishedOnly ? list.filter(p => p.published) : list);
        }
      };
    } catch {
      // Ignore broadcast channel errors
    }
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_projects_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

/**
 * Fetch all projects from Firestore (primary)
 * @param {boolean} publishedOnly - If true, queries with where('published', '==', true)
 */
export const getAllProjects = async (publishedOnly = true) => {
  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = publishedOnly 
        ? query(projectsRef, where('published', '==', true))
        : query(projectsRef);

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      saveLocalProjects(list);
      return list;
    } catch (error) {
      console.error('Firestore getAllProjects failed with code:', error?.code || 'unknown', error);
      const local = getLocalProjects();
      return publishedOnly ? local.filter(p => p.published) : local;
    }
  }

  console.error('Firebase is not configured. Falling back to localStorage for getAllProjects.');
  const local = getLocalProjects();
  return publishedOnly ? local.filter(p => p.published) : local;
};

/**
 * Fetch single project by ID from Firestore
 */
export const getProjectById = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Firestore getProjectById failed with code:', err?.code || 'unknown', err);
    }
  }

  const local = getLocalProjects();
  return local.find(p => p.id === id) || null;
};

/**
 * Check if Firebase Firestore is reachable and readable
 */
export const checkFirestoreAccess = async () => {
  if (!isFirebaseConfigured() || !db) {
    return { ok: false, error: 'Firebase is not initialized or configured.' };
  }
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('published', '==', true));
    await getDocs(q);
    return { ok: true };
  } catch (err) {
    console.error('Firestore access check failed with code:', err?.code || 'unknown', err);
    return { 
      ok: false, 
      code: err?.code || 'permission-denied', 
      message: err?.message || 'Permission denied by Firestore rules.' 
    };
  }
};

/**
 * One-time migration helper: push local storage projects to Firestore
 */
export const syncAllLocalProjectsToFirestore = async () => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase Firestore is not configured or unavailable.');
  }

  const local = getLocalProjects();
  if (local.length === 0) return 0;

  let successCount = 0;
  for (const proj of local) {
    try {
      const docRef = doc(db, 'projects', proj.id);
      await setDoc(docRef, {
        ...proj,
        updatedAt: serverTimestamp()
      }, { merge: true });
      successCount++;
    } catch (err) {
      console.error(`Failed to migrate project ${proj.id} with code:`, err?.code || 'unknown', err);
      throw err;
    }
  }

  return successCount;
};

/**
 * Create a new engineering project in Firestore first (Admin)
 */
export const createProject = async (projectData) => {
  const published = projectData.published ?? true;

  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newRecord = {
        id: docRef.id,
        ...projectData,
        published,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const local = getLocalProjects().filter(p => p.id !== docRef.id);
      local.unshift(newRecord);
      saveLocalProjects(local);

      console.info(`Project created in Firestore with ID: ${docRef.id}`);
      return newRecord;
    } catch (error) {
      console.error('Firestore createProject failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Saving project to localStorage fallback.');
  const fallbackRecord = {
    ...projectData,
    id: `proj_${Date.now()}`,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const local = getLocalProjects();
  local.unshift(fallbackRecord);
  saveLocalProjects(local);
  return fallbackRecord;
};

/**
 * Update an existing project in Firestore first (Admin)
 */
export const updateProject = async (id, updates) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const local = getLocalProjects();
      const index = local.findIndex(p => p.id === id);
      const updatedRecord = { id, ...updates, updatedAt: new Date().toISOString() };
      if (index !== -1) {
        local[index] = { ...local[index], ...updatedRecord };
      } else {
        local.unshift(updatedRecord);
      }
      saveLocalProjects(local);
      console.info(`Project ${id} updated in Firestore.`);
      return updatedRecord;
    } catch (error) {
      console.error('Firestore updateProject failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Updating project in localStorage fallback.');
  const local = getLocalProjects();
  const index = local.findIndex(p => p.id === id);
  const updatedRecord = { id, ...updates, updatedAt: new Date().toISOString() };
  if (index !== -1) {
    local[index] = { ...local[index], ...updatedRecord };
    saveLocalProjects(local);
  }
  return updatedRecord;
};

/**
 * Delete a project in Firestore first (Admin)
 */
export const deleteProject = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
      const filtered = getLocalProjects().filter(p => p.id !== id);
      saveLocalProjects(filtered);
      console.info(`Project ${id} deleted from Firestore.`);
      return true;
    } catch (error) {
      console.error('Firestore deleteProject failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Deleting project from localStorage fallback.');
  const filtered = getLocalProjects().filter(p => p.id !== id);
  saveLocalProjects(filtered);
  return true;
};

/**
 * Seed initial sample projects directly into Firestore (Admin utility)
 */
export const seedInitialProjectsToFirestore = async () => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase Firestore is not configured or unavailable.');
  }

  let count = 0;
  for (const proj of initialProjects) {
    try {
      const docRef = doc(db, 'projects', proj.id);
      await setDoc(docRef, {
        ...proj,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      count++;
    } catch (e) {
      console.error(`Seed failed for project ${proj.id} with code:`, e?.code || 'unknown', e);
      throw e;
    }
  }

  saveLocalProjects(initialProjects);
  return count;
};

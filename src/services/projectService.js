// Project Service — Firestore Integration with Instant Real-Time Synchronization & Local Storage Fallback Cache
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  toISOStringSafe
} from './firebase';
import { initialProjects } from '../data/seedProjects';

const LOCAL_STORAGE_KEY = 'gg_techcore_projects_v2';

/**
 * Read projects from local storage cache.
 * If empty or uninitialized, falls back to the 6 default reference projects.
 */
export const getLocalProjects = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProjects));
      return initialProjects;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProjects));
      return initialProjects;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading projects from localStorage:', err);
    return initialProjects;
  }
};

/**
 * Save projects to localStorage and notify all listeners across windows and tabs
 */
export const saveLocalProjects = (projects) => {
  try {
    const dataToSave = Array.isArray(projects) && projects.length > 0 ? projects : initialProjects;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('gg_projects_updated', { detail: dataToSave }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'PROJECTS_UPDATED', data: dataToSave });
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
 * Real-time subscription for projects (Firestore onSnapshot primary with automatic seeding & local fallback)
 * @param {function} callback
 * @param {boolean} publishedOnly - If true, filters for published projects
 */
export const subscribeToProjects = (callback, publishedOnly = false) => {
  // 1. Initial immediate invocation from local cache for instant zero-latency render
  const initial = getLocalProjects();
  callback(publishedOnly ? initial.filter(p => p.published) : initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = publishedOnly 
        ? query(projectsRef, where('published', '==', true))
        : query(projectsRef);

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        // When Firestore projects collection is empty initially:
        if (snapshot.empty || snapshot.docs.length === 0) {
          const local = getLocalProjects();
          const fallbackList = local.length > 0 ? local : initialProjects;
          saveLocalProjects(fallbackList);
          callback(publishedOnly ? fallbackList.filter(p => p.published) : fallbackList);

          // Auto-seed to Firestore in background if possible
          seedInitialProjectsToFirestore().catch(e => {
            console.info('Auto-seed to Firestore notice (offline or rules protected):', e?.message || e);
          });
          return;
        }

        const list = snapshot.docs.map(d => {
          const data = d.data();
          return { 
            id: d.id, 
            ...data, 
            createdAt: toISOStringSafe(data.createdAt), 
            updatedAt: toISOStringSafe(data.updatedAt) 
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // When publishedOnly is true, preserve any local drafts in localStorage
        if (publishedOnly) {
          const currentLocal = getLocalProjects();
          const drafts = currentLocal.filter(p => !p.published);
          const publishedIds = new Set(list.map(p => p.id));
          const preservedDrafts = drafts.filter(d => !publishedIds.has(d.id));
          saveLocalProjects([...list, ...preservedDrafts]);
        } else {
          saveLocalProjects(list);
        }

        callback(list);
      }, (err) => {
        console.warn('Firestore subscribeToProjects onSnapshot notice, using local cache:', err?.code || 'unknown', err?.message);
        const local = getLocalProjects();
        callback(publishedOnly ? local.filter(p => p.published) : local);
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for projects, using local cache:', e?.code || 'unknown', e?.message);
      const local = getLocalProjects();
      callback(publishedOnly ? local.filter(p => p.published) : local);
    }
  } else {
    const local = getLocalProjects();
    callback(publishedOnly ? local.filter(p => p.published) : local);
  }

  // Local custom event listener for immediate same-window updates across components
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
 * Fetch all projects from Firestore with localStorage fallback
 * @param {boolean} publishedOnly
 */
export const getAllProjects = async (publishedOnly = true) => {
  if (isFirebaseConfigured() && db) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = publishedOnly 
        ? query(projectsRef, where('published', '==', true))
        : query(projectsRef);

      const snapshot = await getDocs(q);
      if (snapshot.empty || snapshot.docs.length === 0) {
        const local = getLocalProjects();
        const fallbackList = local.length > 0 ? local : initialProjects;
        saveLocalProjects(fallbackList);
        return publishedOnly ? fallbackList.filter(p => p.published) : fallbackList;
      }

      const list = snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data, 
          createdAt: toISOStringSafe(data.createdAt), 
          updatedAt: toISOStringSafe(data.updatedAt) 
        };
      });
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      if (!publishedOnly) {
        saveLocalProjects(list);
      }
      return list;
    } catch (error) {
      console.warn('Firestore getAllProjects notice, using local cache:', error?.code || 'unknown', error?.message);
      const local = getLocalProjects();
      return publishedOnly ? local.filter(p => p.published) : local;
    }
  }

  const local = getLocalProjects();
  return publishedOnly ? local.filter(p => p.published) : local;
};

/**
 * Fetch single project by ID from Firestore with localStorage fallback
 */
export const getProjectById = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data, 
          createdAt: toISOStringSafe(data.createdAt), 
          updatedAt: toISOStringSafe(data.updatedAt) 
        };
      }
    } catch (err) {
      console.warn('Firestore getProjectById notice, checking local cache:', err?.code || 'unknown', err?.message);
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
 * Sync all projects currently in local storage to Firestore
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
      console.error(`Failed to migrate project ${proj.id}:`, err?.code || 'unknown', err);
      throw err;
    }
  }

  return successCount;
};

/**
 * Create a new engineering project (Admin)
 * Persists immediately to localStorage fallback cache and attempts Firestore cloud sync.
 */
export const createProject = async (projectData) => {
  const published = projectData.published ?? true;
  const newId = projectData.id || `proj_${Date.now()}`;
  const newRecord = {
    ...projectData,
    id: newId,
    published,
    createdAt: projectData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Immediate local persistence & event dispatch so Home and Projects Showcase update at once
  const local = getLocalProjects().filter(p => p.id !== newId);
  local.unshift(newRecord);
  saveLocalProjects(local);

  let firestoreError = null;
  let synced = false;

  // 2. Sync to Firestore Cloud
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', newId);
      await setDoc(docRef, {
        ...projectData,
        id: newId,
        published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      synced = true;
      console.info(`Project created in Firestore with ID: ${newId}`);
    } catch (error) {
      firestoreError = error?.message || 'Firestore cloud write failed';
      console.warn('Firestore createProject notice (persisted in local fallback):', firestoreError);
    }
  }

  return { ...newRecord, synced, firestoreError };
};

/**
 * Update an existing project (Admin)
 * Persists immediately to localStorage fallback cache and attempts Firestore cloud sync.
 */
export const updateProject = async (id, updates) => {
  const local = getLocalProjects();
  const index = local.findIndex(p => p.id === id);
  const updatedRecord = { 
    ...(index !== -1 ? local[index] : {}),
    ...updates, 
    id, 
    updatedAt: new Date().toISOString() 
  };
  
  if (index !== -1) {
    local[index] = updatedRecord;
  } else {
    local.unshift(updatedRecord);
  }
  saveLocalProjects(local);

  let firestoreError = null;
  let synced = false;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await setDoc(docRef, {
        ...updatedRecord,
        updatedAt: serverTimestamp()
      }, { merge: true });
      synced = true;
      console.info(`Project ${id} updated in Firestore.`);
    } catch (error) {
      firestoreError = error?.message || 'Firestore cloud update failed';
      console.warn('Firestore updateProject notice (persisted in local fallback):', firestoreError);
    }
  }

  return { ...updatedRecord, synced, firestoreError };
};

/**
 * Delete a project (Admin)
 * Persists immediately to localStorage fallback cache and attempts Firestore cloud sync.
 */
export const deleteProject = async (id) => {
  const filtered = getLocalProjects().filter(p => p.id !== id);
  saveLocalProjects(filtered);

  let firestoreError = null;
  let synced = false;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
      synced = true;
      console.info(`Project ${id} deleted from Firestore.`);
    } catch (error) {
      firestoreError = error?.message || 'Firestore cloud delete failed';
      console.warn('Firestore deleteProject notice (removed from local fallback):', firestoreError);
    }
  }

  return { success: true, synced, firestoreError };
};

/**
 * Seed initial sample projects directly into Firestore
 */
export const seedInitialProjectsToFirestore = async () => {
  if (!isFirebaseConfigured() || !db) {
    saveLocalProjects(initialProjects);
    return initialProjects.length;
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
      console.warn(`Seed failed for project ${proj.id}:`, e?.message || e);
    }
  }

  saveLocalProjects(initialProjects);
  return count;
};

// Booking Service — Customer Project Bookings & Custom Abstract Submissions
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp
} from './firebase';

const LOCAL_STORAGE_BOOKINGS_KEY = 'gg_techcore_bookings_v1';

// Initial sample bookings for demonstration fallback
const sampleBookings = [
  {
    id: "book_sample_01",
    customerName: "Dr. Arvind Ramesh",
    email: "arvind.ramesh@medtechlabs.org",
    phone: "+91 98450 12345",
    organization: "Apex Super Specialty Hospital",
    bookingType: "Existing Project",
    projectId: "proj_esp32_smart_iv",
    projectTitle: "Smart Hospital Infusion & IV Monitoring System",
    projectAbstract: "We require 20 units of the ESP32 Smart IV monitor tailored to our ICU beds with custom telemetry output to our local HL7 hospital records gateway.",
    problemStatement: "Current ward rounds cannot catch subtle drip rate changes during night shifts, resulting in air pockets in tubing.",
    proposedSolution: "Deploy 20 retrofit load-cell & optical drip counters on IV poles.",
    objectives: "Integrate with our in-house Linux gateway and run a 30-day clinical validation trial.",
    projectOverview: "Standard deployment with custom enclosure brackets for 32mm stainless steel poles.",
    hardwareRequirements: "20x ESP32 nodes, 20x 1kg load cells, 20x rechargeable Li-ion packs.",
    softwareRequirements: "Custom MQTT topic prefix and TLS certificate embedding.",
    additionalRequirements: "Need IP54 water resistance against disinfectant alcohol sprays.",
    budget: "$3,500 - $5,000",
    preferredDate: "2026-12-15",
    attachmentUrls: [
      { name: "ICU_Pole_Mount_Specifications.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ],
    status: "Under Review",
    adminNotes: "Customer contacted via email. Engineering feasibility team reviewing mechanical bracket dimensions.",
    createdAt: "2026-10-18T14:20:00.000Z",
    updatedAt: "2026-10-19T09:10:00.000Z"
  },
  {
    id: "book_sample_02",
    customerName: "Pooja Sundaram",
    email: "pooja.s@agrotech-robotics.io",
    phone: "+91 97123 45678",
    organization: "AgroTech Precision Farms",
    bookingType: "Custom Project",
    projectId: null,
    projectTitle: "Solar-Powered Autonomous Weed Removal Rover with Multi-Spectral Camera",
    projectAbstract: "We are seeking GG TECHCORE's engineering expertise to design and fabricate an autonomous 4-wheel rover capable of identifying broadleaf weeds in cotton crops using edge AI and applying micro-doses of herbicide directly to the weed foliage.",
    problemStatement: "Blanket herbicide spraying wastes 80% of chemical treatments, damages soil biome, and increases runoff into local groundwater.",
    proposedSolution: "A lightweight solar-assisted rover using RGB + NIR vision to classify weeds in real-time, activating targeted micro-solenoids for precision localized dosing.",
    objectives: "Deliver an operational mechanical and electrical prototype with RTK-GPS centimeter navigation and 6 hours solar endurance.",
    projectOverview: "Differential drive rover with 4x geared hub motors, RTK-GNSS module, 100W flexible monocrystalline solar panel, Jetson Nano edge processor, and 4-nozzle solenoid manifold.",
    hardwareRequirements: "Jetson Nano 4GB, 4x 24V Hub Motors, RTK-GPS receiver, 24V 30Ah LiFePO4 battery, 4x 12V high-speed solenoids.",
    softwareRequirements: "ROS2 navigation stack, YOLOv8 weed detection model trained for cotton foliage, web control dashboard.",
    additionalRequirements: "Must withstand ambient operating temperatures up to 45°C and dusty agricultural conditions.",
    budget: "$8,000 - $12,000",
    preferredDate: "2027-02-28",
    attachmentUrls: [
      { name: "Field_Survey_And_Weed_Dataset.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ],
    status: "Pending",
    adminNotes: "New custom submission. Awaiting initial technical review from robotics team.",
    createdAt: "2026-10-22T11:45:00.000Z",
    updatedAt: "2026-10-22T11:45:00.000Z"
  }
];

export const getLocalBookings = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    if (!raw) {
      return sampleBookings;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : sampleBookings;
  } catch (err) {
    console.error('Error reading bookings from localStorage:', err);
    return sampleBookings;
  }
};

export const saveLocalBookings = (bookings) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent('gg_bookings_updated', { detail: bookings }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('gg_techcore_sync');
        bc.postMessage({ type: 'BOOKINGS_UPDATED', data: bookings });
        bc.close();
      } catch {
        // Optional multi-tab broadcast
      }
    }
  } catch (err) {
    console.error('Error saving bookings to localStorage:', err);
  }
};

/**
 * Real-time subscription for customer project idea submissions (Firestore primary)
 */
export const subscribeToBookings = (callback) => {
  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      unsubscribeFirestore = onSnapshot(bookingsRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveLocalBookings(list);
        callback(list);
      }, (err) => {
        console.error('Firestore bookings onSnapshot error with code:', err?.code || 'unknown', err);
        callback(getLocalBookings());
      });
    } catch (e) {
      console.error('Could not attach Firestore onSnapshot for bookings with code:', e?.code || 'unknown', e);
      callback(getLocalBookings());
    }
  } else {
    console.error('Firebase is not configured. Falling back to localStorage for bookings.');
    callback(getLocalBookings());
  }

  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
    else callback(getLocalBookings());
  };
  window.addEventListener('gg_bookings_updated', handleLocalUpdate);

  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('gg_techcore_sync');
      bc.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'BOOKINGS_UPDATED') {
          callback(msg.data.data);
        }
      };
    } catch {
      // Ignore broadcast errors
    }
  }

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('gg_bookings_updated', handleLocalUpdate);
    if (bc) bc.close();
  };
};

/**
 * Validate customer booking request before persistence
 */
export const validateBookingPayload = (data) => {
  const errors = {};

  if (!data.customerName || !data.customerName.trim()) {
    errors.customerName = 'Full Name is required.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.projectTitle || !data.projectTitle.trim()) {
    errors.projectTitle = 'Project Title is required.';
  }

  if (!data.projectAbstract || !data.projectAbstract.trim()) {
    errors.projectAbstract = 'Project Abstract is required (please provide a detailed technical summary).';
  } else if (data.projectAbstract.trim().length < 30) {
    errors.projectAbstract = 'Project Abstract must be at least 30 characters to facilitate technical review.';
  }

  if (!data.bookingType) {
    data.bookingType = data.projectId ? 'Existing Project' : 'Custom Project';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Submit a customer project booking (Firestore first)
 */
export const submitBooking = async (bookingData) => {
  const validation = validateBookingPayload(bookingData);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const payload = {
    customerName: bookingData.customerName.trim(),
    email: bookingData.email.trim().toLowerCase(),
    phone: bookingData.phone?.trim() || '',
    organization: bookingData.organization?.trim() || '',
    bookingType: bookingData.bookingType || (bookingData.projectId ? 'Existing Project' : 'Custom Project'),
    projectId: bookingData.projectId || null,
    projectTitle: bookingData.projectTitle.trim(),
    projectCategory: bookingData.projectCategory || 'Hardware & Embedded',
    projectAbstract: bookingData.projectAbstract.trim(),
    problemStatement: bookingData.problemStatement?.trim() || '',
    proposedSolution: bookingData.proposedSolution?.trim() || '',
    objectives: bookingData.objectives?.trim() || '',
    projectOverview: bookingData.projectOverview?.trim() || '',
    hardwareRequirements: bookingData.hardwareRequirements?.trim() || '',
    softwareRequirements: bookingData.softwareRequirements?.trim() || '',
    additionalRequirements: bookingData.additionalRequirements?.trim() || '',
    preferredDate: bookingData.preferredDate || '',
    attachmentUrls: bookingData.attachmentUrls || [],
    status: 'Pending',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const docRef = await addDoc(bookingsRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const createdRecord = { id: docRef.id, ...payload };
      
      const local = getLocalBookings().filter(b => b.id !== docRef.id);
      local.unshift(createdRecord);
      saveLocalBookings(local);
      console.info(`Booking created in Firestore with ID: ${docRef.id}`);
      return createdRecord;
    } catch (error) {
      console.error('Firestore submitBooking failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Saving booking to localStorage fallback.');
  const fallbackRecord = {
    ...payload,
    id: `book_${Date.now()}`
  };
  const local = getLocalBookings();
  local.unshift(fallbackRecord);
  saveLocalBookings(local);
  return fallbackRecord;
};

/**
 * Get all bookings from Firestore first (Admin only)
 */
export const getAllBookings = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveLocalBookings(list);
      return list;
    } catch (error) {
      console.error('Firestore getAllBookings failed with code:', error?.code || 'unknown', error);
      return getLocalBookings();
    }
  }

  console.error('Firebase is not configured. Falling back to localStorage for getAllBookings.');
  return getLocalBookings();
};

/**
 * Update booking status and private admin notes in Firestore first
 */
export const updateBookingStatus = async (id, status, adminNotes = '') => {
  const validStatuses = ['Pending', 'Under Review', 'Contacted', 'Confirmed', 'Rejected', 'Completed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const updates = {
    status,
    adminNotes,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const local = getLocalBookings();
      const index = local.findIndex(b => b.id === id);
      if (index !== -1) {
        local[index] = { ...local[index], ...updates };
        saveLocalBookings(local);
      }
      console.info(`Booking ${id} status updated in Firestore.`);
      return { id, ...updates };
    } catch (error) {
      console.error('Firestore updateBookingStatus failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Updating booking in localStorage fallback.');
  const local = getLocalBookings();
  const index = local.findIndex(b => b.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalBookings(local);
    return local[index];
  }
  return null;
};

/**
 * Delete booking in Firestore first (Admin only)
 */
export const deleteBooking = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', id);
      await deleteDoc(docRef);
      const filtered = getLocalBookings().filter(b => b.id !== id);
      saveLocalBookings(filtered);
      console.info(`Booking ${id} deleted from Firestore.`);
      return true;
    } catch (error) {
      console.error('Firestore deleteBooking failed with code:', error?.code || 'unknown', error);
      throw error;
    }
  }

  console.error('Firebase is not configured. Deleting booking from localStorage fallback.');
  const filtered = getLocalBookings().filter(b => b.id !== id);
  saveLocalBookings(filtered);
  return true;
};

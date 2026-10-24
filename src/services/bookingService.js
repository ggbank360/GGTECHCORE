// Booking Service — Customer Project Bookings & Custom Abstract Submissions
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  isPermissionDenied
} from './firebase';

const LOCAL_STORAGE_BOOKINGS_KEY = 'gg_techcore_bookings_v1';

// Initial sample bookings for demonstration
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

const getLocalBookings = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(sampleBookings));
      return sampleBookings;
    }
    return JSON.parse(raw);
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
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving bookings to localStorage:', err);
  }
};

/**
 * Real-time subscription for customer project idea submissions
 */
export const subscribeToBookings = (callback) => {
  const initial = getLocalBookings();
  callback(initial);

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(list));
          callback(list);
        }
      }, (err) => {
        if (!isPermissionDenied(err)) {
          console.warn('Firestore bookings onSnapshot note:', err.message);
        }
      });
    } catch (e) {
      if (!isPermissionDenied(e)) {
        console.warn('Could not attach Firestore onSnapshot for bookings:', e.message);
      }
    }
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
    } catch (e) {}
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
 * Submit a customer project booking or custom project proposal
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

  let createdRecord = null;
  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const docRef = await addDoc(bookingsRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      createdRecord = { id: docRef.id, ...payload };
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.warn('Failed to submit booking to Firestore:', error);
      }
    }
  }

  // Always sync local cache and dispatch immediate live update events
  const local = getLocalBookings();
  const finalRecord = createdRecord || {
    ...payload,
    id: `book_${Date.now()}`
  };
  local.unshift(finalRecord);
  saveLocalBookings(local);
  return finalRecord;
};

/**
 * Get all bookings (Admin only)
 */
export const getAllBookings = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.warn('Firestore bookings query failed, reading local store:', error);
      }
    }
  }

  return getLocalBookings();
};

/**
 * Update booking status and private admin notes
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
      return { id, ...updates };
    } catch (error) {
      console.error('Failed to update booking status in Firestore:', error);
    }
  }

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
 * Delete booking (Admin only)
 */
export const deleteBooking = async (id) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete booking in Firestore:', error);
    }
  }

  const local = getLocalBookings();
  const filtered = local.filter(b => b.id !== id);
  saveLocalBookings(filtered);
  return true;
};

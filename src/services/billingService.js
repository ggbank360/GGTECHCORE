// Billing & Quotations Service for GG TECHCORE Admin
// Supports both Firebase Firestore and LocalStorage fallback with real-time listeners

import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  toISOStringSafe
} from './firebase';

const LOCAL_STORAGE_QUOTATIONS_KEY = 'gg_techcore_quotations_v1';
const LOCAL_STORAGE_INVOICES_KEY = 'gg_techcore_invoices_v1';
const LOCAL_STORAGE_COMPANY_KEY = 'gg_techcore_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE = {
  companyName: "GG TECHCORE",
  tagline: "ENGINEERING IDEAS INTO REALITY",
  address: "TechCore Engineering Park, Electronics Innovation Hub, Coimbatore, Tamil Nadu - 641014, India",
  phone: "+91 77089 49507",
  altPhone: "+91 63744 31113",
  email: "ggbank360@gmail.com",
  website: "www.ggtechcore.com",
  bankName: "HDFC Bank",
  accountName: "GG TECHCORE",
  accountNumber: "50200084920192",
  ifscCode: "HDFC0001234",
  upiId: "ggbank360@okaxis",
  signatoryName: "GOWTHAM N K",
  signatoryTitle: "Authorized Engineering Lab Signatory"
};

export const getCompanyProfile = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMPANY_KEY);
    if (!raw) return DEFAULT_COMPANY_PROFILE;
    return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
};

export const saveCompanyProfile = (profile) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMPANY_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('gg_company_updated', { detail: profile }));
  } catch (err) {
    console.error('Failed to save company profile:', err);
  }
};

// Initial sample quotations for immediate demo
const sampleQuotations = [
  {
    id: "qt_sample_001",
    quotationNumber: "QT-2026-0001",
    date: "2026-11-01",
    validUntil: "2026-12-01",
    customerName: "Dr. Arvind Ramesh",
    companyName: "Apex Super Specialty Hospital",
    email: "arvind.ramesh@medtechlabs.org",
    phone: "+91 98450 12345",
    address: "ICU Ward Tech Division, Central Wing, Chennai - 600028",
    items: [
      {
        id: "item_1",
        description: "ESP32 Industrial Telemetry Hub with OLED & LoRa Interface",
        quantity: 5,
        unitPrice: 3200,
        total: 16000
      },
      {
        id: "item_2",
        description: "High-Precision 1kg Medical Grade Strain Gauge Load Cell",
        quantity: 10,
        unitPrice: 1450,
        total: 14500
      },
      {
        id: "item_3",
        description: "Custom Firmware Engineering & HL7 Gateway Integration",
        quantity: 1,
        unitPrice: 18000,
        total: 18000
      }
    ],
    totalAmount: 48500,
    status: "Sent",
    notes: "Quotation valid for 30 days from issuance. 50% advance upon PO signoff, 50% on test verification. Hardware components carry 1-year laboratory replacement warranty.",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "qt_sample_002",
    quotationNumber: "QT-2026-0002",
    date: "2026-11-05",
    validUntil: "2026-12-05",
    customerName: "Pooja Sundaram",
    companyName: "AgroTech Precision Farms",
    email: "pooja.s@agrotech-robotics.io",
    phone: "+91 97123 45678",
    address: "Greenfield Innovation Campus, Coimbatore - 641014",
    items: [
      {
        id: "item_1",
        description: "NVIDIA Jetson Nano 4GB AI Vision Kit with Enclosure",
        quantity: 2,
        unitPrice: 19500,
        total: 39000
      },
      {
        id: "item_2",
        description: "24V Planetary Geared High-Torque Hub Motors (Set of 4)",
        quantity: 1,
        unitPrice: 22000,
        total: 22000
      },
      {
        id: "item_3",
        description: "RTK Centimeter Centric GPS Rover Antenna Module",
        quantity: 1,
        unitPrice: 14800,
        total: 14800
      }
    ],
    totalAmount: 75800,
    status: "Accepted",
    notes: "Includes system assembly, wiring harnesses, and initial ROS2 camera sensor calibration. Lead time: 10 working days.",
    createdAt: "2026-11-05T14:30:00.000Z",
    updatedAt: "2026-11-05T14:30:00.000Z"
  }
];

// Initial sample invoices for immediate demo
const sampleInvoices = [
  {
    id: "inv_sample_001",
    invoiceNumber: "INV-2026-0001",
    date: "2026-11-03",
    dueDate: "2026-11-17",
    customerName: "Karthik Subramanian",
    companyName: "CyberMesh Dynamics Pvt Ltd",
    email: "karthik.subramanian@cybermesh.io",
    phone: "+91 94441 53974",
    address: "Plot 42, Electronics City Phase 1, Bangalore - 560100",
    paymentStatus: "Paid",
    paymentMode: "Bank Transfer / NEFT",
    transactionRef: "NEFT-HDFC-994821035",
    items: [
      {
        id: "item_1",
        description: "Custom 4-Layer High-Density BLDC Motor Controller PCB Batch (5 Units)",
        quantity: 5,
        unitPrice: 4200,
        total: 21000
      },
      {
        id: "item_2",
        description: "STM32F405 Vector Control Firmware Flashing & Bench Dynamometer Testing",
        quantity: 1,
        unitPrice: 12500,
        total: 12500
      },
      {
        id: "item_3",
        description: "CAN-FD Telemetry Harness & IP67 Enclosure Assembly",
        quantity: 5,
        unitPrice: 1300,
        total: 6500
      }
    ],
    subtotal: 40000,
    discount: 2500,
    finalAmount: 37500,
    notes: "Payment received in full. Thank you for partnering with GG TECHCORE for your engineering hardware prototyping needs.",
    createdAt: "2026-11-03T09:15:00.000Z",
    updatedAt: "2026-11-03T09:15:00.000Z"
  },
  {
    id: "inv_sample_002",
    invoiceNumber: "INV-2026-0002",
    date: "2026-11-07",
    dueDate: "2026-11-21",
    customerName: "Dr. Arvind Ramesh",
    companyName: "Apex Super Specialty Hospital",
    email: "arvind.ramesh@medtechlabs.org",
    phone: "+91 98450 12345",
    address: "ICU Ward Tech Division, Central Wing, Chennai - 600028",
    paymentStatus: "Pending",
    paymentMode: "UPI / QR Code",
    transactionRef: "",
    items: [
      {
        id: "item_1",
        description: "ESP32 Industrial Telemetry Hub with OLED & LoRa Interface (Advance 50%)",
        quantity: 1,
        unitPrice: 24250,
        total: 24250
      }
    ],
    subtotal: 24250,
    discount: 0,
    finalAmount: 24250,
    notes: "Phase 1 milestone bill for telemetry prototyping as per signed Quotation QT-2026-0001.",
    createdAt: "2026-11-07T11:20:00.000Z",
    updatedAt: "2026-11-07T11:20:00.000Z"
  }
];

// --- LOCAL STORAGE HELPERS ---

export const getLocalQuotations = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUOTATIONS_KEY);
    if (!raw) return sampleQuotations;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : sampleQuotations;
  } catch (err) {
    console.error('Error reading quotations from localStorage:', err);
    return sampleQuotations;
  }
};

export const saveLocalQuotations = (quotations) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_QUOTATIONS_KEY, JSON.stringify(quotations));
    window.dispatchEvent(new CustomEvent('gg_quotations_updated', { detail: quotations }));
  } catch (err) {
    console.error('Error saving quotations to localStorage:', err);
  }
};

export const getLocalInvoices = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
    if (!raw) return sampleInvoices;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : sampleInvoices;
  } catch (err) {
    console.error('Error reading invoices from localStorage:', err);
    return sampleInvoices;
  }
};

export const saveLocalInvoices = (invoices) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    window.dispatchEvent(new CustomEvent('gg_invoices_updated', { detail: invoices }));
  } catch (err) {
    console.error('Error saving invoices to localStorage:', err);
  }
};

// --- NUMBER GENERATORS ---

export const getNextQuotationNumber = (existingList = []) => {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  existingList.forEach(q => {
    if (q.quotationNumber && q.quotationNumber.startsWith(`QT-${year}-`)) {
      const parts = q.quotationNumber.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `QT-${year}-${nextSeq}`;
};

export const getNextInvoiceNumber = (existingList = []) => {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  existingList.forEach(inv => {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(`INV-${year}-`)) {
      const parts = inv.invoiceNumber.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `INV-${year}-${nextSeq}`;
};

// --- QUOTATION OPERATIONS ---

export const getAllQuotations = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const qRef = collection(db, 'quotations');
      const snap = await getDocs(qRef);
      if (!snap.empty) {
        const list = snap.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            ...d,
            createdAt: toISOStringSafe(d.createdAt),
            updatedAt: toISOStringSafe(d.updatedAt)
          };
        });
        list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        saveLocalQuotations(list);
        return list;
      }
    } catch (err) {
      console.warn('Firestore quotations fetch error, falling back to local storage:', err);
    }
  }
  return getLocalQuotations();
};

export const createQuotation = async (quotationData) => {
  const now = new Date().toISOString();
  const id = 'qt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  const newQuotation = {
    ...quotationData,
    id,
    createdAt: now,
    updatedAt: now
  };

  // 1. Update LocalStorage
  const localList = getLocalQuotations();
  const updatedList = [newQuotation, ...localList];
  saveLocalQuotations(updatedList);

  // 2. Sync to Firestore if available
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'quotations', id);
      await setDoc(docRef, {
        ...newQuotation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not sync quotation to Firestore:', err);
    }
  }

  return newQuotation;
};

export const updateQuotation = async (id, patchData) => {
  const now = new Date().toISOString();
  const localList = getLocalQuotations();
  const updatedList = localList.map(q => q.id === id ? { ...q, ...patchData, updatedAt: now } : q);
  saveLocalQuotations(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'quotations', id);
      await updateDoc(docRef, {
        ...patchData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not update quotation in Firestore:', err);
    }
  }
};

export const deleteQuotation = async (id) => {
  const localList = getLocalQuotations();
  const updatedList = localList.filter(q => q.id !== id);
  saveLocalQuotations(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'quotations', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete quotation from Firestore:', err);
    }
  }
};

export const subscribeToQuotations = (callback) => {
  let unsubFirestore = () => {};

  if (isFirebaseConfigured() && db) {
    try {
      const qRef = collection(db, 'quotations');
      unsubFirestore = onSnapshot(qRef, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              ...d,
              createdAt: toISOStringSafe(d.createdAt),
              updatedAt: toISOStringSafe(d.updatedAt)
            };
          });
          list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          saveLocalQuotations(list);
          callback(list);
        } else {
          callback(getLocalQuotations());
        }
      }, (err) => {
        console.warn('Firestore quotations subscription notice:', err);
        callback(getLocalQuotations());
      });
    } catch {
      callback(getLocalQuotations());
    }
  } else {
    callback(getLocalQuotations());
  }

  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('gg_quotations_updated', handleLocalUpdate);

  return () => {
    unsubFirestore();
    window.removeEventListener('gg_quotations_updated', handleLocalUpdate);
  };
};

// --- INVOICE / FINAL BILL OPERATIONS ---

export const getAllInvoices = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const invRef = collection(db, 'invoices');
      const snap = await getDocs(invRef);
      if (!snap.empty) {
        const list = snap.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            ...d,
            createdAt: toISOStringSafe(d.createdAt),
            updatedAt: toISOStringSafe(d.updatedAt)
          };
        });
        list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        saveLocalInvoices(list);
        return list;
      }
    } catch (err) {
      console.warn('Firestore invoices fetch error, falling back to local storage:', err);
    }
  }
  return getLocalInvoices();
};

export const createInvoice = async (invoiceData) => {
  const now = new Date().toISOString();
  const id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  const newInvoice = {
    ...invoiceData,
    id,
    createdAt: now,
    updatedAt: now
  };

  // 1. Update LocalStorage
  const localList = getLocalInvoices();
  const updatedList = [newInvoice, ...localList];
  saveLocalInvoices(updatedList);

  // 2. Sync to Firestore if available
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'invoices', id);
      await setDoc(docRef, {
        ...newInvoice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not sync invoice to Firestore:', err);
    }
  }

  return newInvoice;
};

export const updateInvoice = async (id, patchData) => {
  const now = new Date().toISOString();
  const localList = getLocalInvoices();
  const updatedList = localList.map(inv => inv.id === id ? { ...inv, ...patchData, updatedAt: now } : inv);
  saveLocalInvoices(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        ...patchData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not update invoice in Firestore:', err);
    }
  }
};

export const deleteInvoice = async (id) => {
  const localList = getLocalInvoices();
  const updatedList = localList.filter(inv => inv.id !== id);
  saveLocalInvoices(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'invoices', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete invoice from Firestore:', err);
    }
  }
};

export const subscribeToInvoices = (callback) => {
  let unsubFirestore = () => {};

  if (isFirebaseConfigured() && db) {
    try {
      const invRef = collection(db, 'invoices');
      unsubFirestore = onSnapshot(invRef, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              ...d,
              createdAt: toISOStringSafe(d.createdAt),
              updatedAt: toISOStringSafe(d.updatedAt)
            };
          });
          list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          saveLocalInvoices(list);
          callback(list);
        } else {
          callback(getLocalInvoices());
        }
      }, (err) => {
        console.warn('Firestore invoices subscription notice:', err);
        callback(getLocalInvoices());
      });
    } catch {
      callback(getLocalInvoices());
    }
  } else {
    callback(getLocalInvoices());
  }

  const handleLocalUpdate = (e) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('gg_invoices_updated', handleLocalUpdate);

  return () => {
    unsubFirestore();
    window.removeEventListener('gg_invoices_updated', handleLocalUpdate);
  };
};


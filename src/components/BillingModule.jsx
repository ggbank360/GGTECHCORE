import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Eye, 
  RefreshCw, 
  Save, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  RotateCcw,
  User
} from 'lucide-react';
import { 
  createQuotation, 
  deleteQuotation, 
  subscribeToQuotations,
  getNextQuotationNumber,
  createInvoice, 
  updateInvoice, 
  deleteInvoice, 
  subscribeToInvoices,
  getNextInvoiceNumber 
} from '../services/billingService';
import { generateQuotationPDF, generateBillingPDF } from '../utils/pdfGenerator';
import { A4DocumentPreview } from './A4DocumentPreview';
import { numberToWords, formatINR } from '../utils/numberToWords';

export const BillingModule = () => {
  // Navigation mode: 'cards' (ONLY TWO MAIN CARDS) | 'quotation' | 'billing'
  const [currentSection, setCurrentSection] = useState('cards');

  // Sub-views for each section: 'create' | 'history'
  const [quotationSubView, setQuotationSubView] = useState('create');
  const [billingSubView, setBillingSubView] = useState('create');

  // Data lists
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Search & Filter
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState('ALL');
  const [billingSearch, setBillingSearch] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('ALL');

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null); // { type: 'quotation' | 'billing', data: {...} }

  // Action Notification Banner
  const [bannerMessage, setBannerMessage] = useState('');
  const showBanner = (msg) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(''), 4500);
  };

  // -------------------------------------------------------------
  // QUOTATION STATE & HELPERS
  // -------------------------------------------------------------
  const getInitialQuotationForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    const validUntil = validDate.toISOString().split('T')[0];

    return {
      quotationNumber: getNextQuotationNumber(quotations),
      date: today,
      validUntil,
      status: 'Sent',
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      items: [
        { id: 'item_' + Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 }
      ],
      notes: '1. Quotation valid for 30 days from issuance.\n2. 50% advance along with purchase order; remaining balance upon successful delivery.\n3. Hardware components carry 1-year GG TECHCORE laboratory warranty.'
    };
  };

  const [quotationForm, setQuotationForm] = useState(getInitialQuotationForm);

  // -------------------------------------------------------------
  // BILLING STATE & HELPERS
  // -------------------------------------------------------------
  const getInitialBillingForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 14);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    return {
      invoiceNumber: getNextInvoiceNumber(invoices),
      date: today,
      dueDate,
      paymentStatus: 'Pending',
      paymentMode: 'Bank Transfer / NEFT',
      transactionRef: '',
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      discount: 0,
      items: [
        { id: 'item_' + Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 }
      ],
      notes: '1. Commercial bill without GST/tax calculations.\n2. Bank: GG TECHCORE Engineering Solutions | UPI ID: ggbank360@okaxis\n3. For electronic transfers, please share the transaction reference.'
    };
  };

  const [billingForm, setBillingForm] = useState(getInitialBillingForm);

  // Subscribe to real-time data
  useEffect(() => {
    const unsubQuotations = subscribeToQuotations((list) => {
      setQuotations(list);
      setQuotationForm(prev => {
        if (!prev.customerName) {
          return { ...prev, quotationNumber: getNextQuotationNumber(list) };
        }
        return prev;
      });
    });

    const unsubInvoices = subscribeToInvoices((list) => {
      setInvoices(list);
      setBillingForm(prev => {
        if (!prev.customerName) {
          return { ...prev, invoiceNumber: getNextInvoiceNumber(list) };
        }
        return prev;
      });
    });

    return () => {
      unsubQuotations();
      unsubInvoices();
    };
  }, []);

  // -------------------------------------------------------------
  // QUOTATION ITEM OPERATIONS & CALCULATIONS
  // -------------------------------------------------------------
  const handleAddQuotationItem = () => {
    setQuotationForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), description: '', quantity: 1, unitPrice: 0, total: 0 }
      ]
    }));
  };

  const handleRemoveQuotationItem = (index) => {
    if (quotationForm.items.length <= 1) {
      showBanner('At least one item is required in the quotation.');
      return;
    }
    setQuotationForm(prev => {
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const handleQuotationItemChange = (index, field, value) => {
    setQuotationForm(prev => {
      const updated = [...prev.items];
      const targetItem = { ...updated[index] };
      
      if (field === 'quantity') {
        targetItem.quantity = Math.max(1, parseInt(value, 10) || 0);
      } else if (field === 'unitPrice') {
        targetItem.unitPrice = Math.max(0, parseFloat(value) || 0);
      } else {
        targetItem[field] = value;
      }
      
      targetItem.total = (targetItem.quantity || 1) * (targetItem.unitPrice || 0);
      updated[index] = targetItem;
      return { ...prev, items: updated };
    });
  };

  // Calculate quotation total
  const quotationCalculatedTotal = (quotationForm.items || []).reduce((sum, it) => {
    return sum + ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0));
  }, 0);

  // Save Quotation
  const handleSaveQuotation = async (e) => {
    if (e) e.preventDefault();
    if (!quotationForm.customerName.trim()) {
      alert('Please enter Customer Name.');
      return;
    }
    const hasValidItems = quotationForm.items.some(it => it.description.trim());
    if (!hasValidItems) {
      alert('Please enter at least one item description.');
      return;
    }

    const payload = {
      ...quotationForm,
      totalAmount: quotationCalculatedTotal,
      items: quotationForm.items.map(it => ({
        ...it,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      }))
    };

    try {
      await createQuotation(payload);
      showBanner(`✅ Quotation ${payload.quotationNumber} saved successfully to database!`);
      // Reset form with new number
      const fresh = getInitialQuotationForm();
      fresh.quotationNumber = getNextQuotationNumber([...quotations, payload]);
      setQuotationForm(fresh);
      setQuotationSubView('history');
    } catch (err) {
      alert('Error saving quotation: ' + err.message);
    }
  };

  // -------------------------------------------------------------
  // BILLING ITEM OPERATIONS & CALCULATIONS
  // -------------------------------------------------------------
  const handleAddBillingItem = () => {
    setBillingForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), description: '', quantity: 1, unitPrice: 0, total: 0 }
      ]
    }));
  };

  const handleRemoveBillingItem = (index) => {
    if (billingForm.items.length <= 1) {
      showBanner('At least one item is required in the bill.');
      return;
    }
    setBillingForm(prev => {
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const handleBillingItemChange = (index, field, value) => {
    setBillingForm(prev => {
      const updated = [...prev.items];
      const targetItem = { ...updated[index] };
      
      if (field === 'quantity') {
        targetItem.quantity = Math.max(1, parseInt(value, 10) || 0);
      } else if (field === 'unitPrice') {
        targetItem.unitPrice = Math.max(0, parseFloat(value) || 0);
      } else {
        targetItem[field] = value;
      }
      
      targetItem.total = (targetItem.quantity || 1) * (targetItem.unitPrice || 0);
      updated[index] = targetItem;
      return { ...prev, items: updated };
    });
  };

  // Calculate billing totals (No GST or taxes)
  const billingSubtotal = (billingForm.items || []).reduce((sum, it) => {
    return sum + ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0));
  }, 0);
  const billingDiscount = Math.max(0, parseFloat(billingForm.discount) || 0);
  const billingFinalAmount = Math.max(0, billingSubtotal - billingDiscount);

  // Save Final Bill
  const handleSaveInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!billingForm.customerName.trim()) {
      alert('Please enter Customer Name.');
      return;
    }
    const hasValidItems = billingForm.items.some(it => it.description.trim());
    if (!hasValidItems) {
      alert('Please enter at least one item description.');
      return;
    }

    const payload = {
      ...billingForm,
      subtotal: billingSubtotal,
      discount: billingDiscount,
      finalAmount: billingFinalAmount,
      items: billingForm.items.map(it => ({
        ...it,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      }))
    };

    try {
      await createInvoice(payload);
      showBanner(`✅ Final Bill ${payload.invoiceNumber} saved successfully to database!`);
      const fresh = getInitialBillingForm();
      fresh.invoiceNumber = getNextInvoiceNumber([...invoices, payload]);
      setBillingForm(fresh);
      setBillingSubView('history');
    } catch (err) {
      alert('Error saving bill: ' + err.message);
    }
  };

  // Toggle invoice payment status
  const handleToggleInvoiceStatus = async (inv) => {
    const nextStatus = inv.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    await updateInvoice(inv.id, { paymentStatus: nextStatus });
    showBanner(`Invoice ${inv.invoiceNumber} marked as ${nextStatus}.`);
  };

  // Delete handlers
  const handleDeleteQuotation = async (id, num) => {
    if (window.confirm(`Are you sure you want to delete Quotation ${num}?`)) {
      await deleteQuotation(id);
      showBanner(`Quotation ${num} deleted.`);
    }
  };

  const handleDeleteInvoice = async (id, num) => {
    if (window.confirm(`Are you sure you want to delete Final Bill ${num}?`)) {
      await deleteInvoice(id);
      showBanner(`Final Bill ${num} deleted.`);
    }
  };

  // Filtered lists
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = (q.quotationNumber || '').toLowerCase().includes(quotationSearch.toLowerCase()) ||
                          (q.customerName || '').toLowerCase().includes(quotationSearch.toLowerCase()) ||
                          (q.companyName || '').toLowerCase().includes(quotationSearch.toLowerCase());
    const matchesStatus = quotationStatusFilter === 'ALL' || q.status === quotationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes(billingSearch.toLowerCase()) ||
                          (inv.customerName || '').toLowerCase().includes(billingSearch.toLowerCase()) ||
                          (inv.companyName || '').toLowerCase().includes(billingSearch.toLowerCase());
    const matchesStatus = billingStatusFilter === 'ALL' || inv.paymentStatus === billingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level stats
  const totalQuotationValue = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  const totalBilledValue = invoices.reduce((sum, inv) => sum + (Number(inv.finalAmount) || 0), 0);
  const paidBilledValue = invoices
    .filter(inv => inv.paymentStatus === 'Paid')
    .reduce((sum, inv) => sum + (Number(inv.finalAmount) || 0), 0);

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Banner message */}
      {bannerMessage && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
          fontSize: '0.92rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle size={18} />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEW: ONLY TWO MAIN CARDS (QUOTATION & BILLING)                     */}
      {/* ========================================================================= */}
      {currentSection === 'cards' && (
        <div>
          {/* Section Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              <span>GG TECHCORE Admin Hub</span> &bull; <span>Financial Management</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', marginBottom: '0.4rem' }}>
              Billing & Commercial Operations
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '750px', lineHeight: 1.5 }}>
              Generate independent engineering quotations and final commercial bills with automated real-time calculations, clean A4 PDF export, and database synchronization.
            </p>
          </div>

          {/* TWO MAIN CARDS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2.5rem'
          }}>

            {/* CARD 1: QUOTATION */}
            <div 
              className="tech-card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)'
              }}
            >
              <div>
                {/* Header with Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #7dd3fc'
                  }}>
                    <FileText size={28} color="#0284c7" />
                  </div>

                  <span style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    Option 1
                  </span>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  QUOTATION
                </h3>

                <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Create detailed hardware engineering cost proposals and service estimates. Add unlimited items with dynamic line-item recalculation, generate unique quote numbers, and export professional A4 PDFs.
                </p>

                {/* Key Metrics / Snapshot */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Quotations Filed
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                      {quotations.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Pipeline Volume
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {formatINR(totalQuotationValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setCurrentSection('quotation');
                    setQuotationSubView('create');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem 1.25rem', fontSize: '0.95rem' }}
                >
                  <Plus size={18} />
                  <span>Create New Quotation</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentSection('quotation');
                    setQuotationSubView('history');
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                >
                  <Clock size={16} />
                  <span>Quotation History ({quotations.length})</span>
                </button>
              </div>
            </div>

            {/* CARD 2: BILLING */}
            <div 
              className="tech-card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
              }}
            >
              <div>
                {/* Header with Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #93c5fd'
                  }}>
                    <Receipt size={28} color="#2563eb" />
                  </div>

                  <span style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    Option 2
                  </span>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  BILLING
                </h3>

                <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Generate final tax-free commercial invoices and payment receipts. Add unlimited products/services, apply flat discounts, track payment status (Paid/Pending), and download branded A4 bills.
                </p>

                {/* Key Metrics / Snapshot */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Bills Issued
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                      {invoices.length}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                      Paid: {formatINR(paidBilledValue)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Commercial Billed
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {formatINR(totalBilledValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setCurrentSection('billing');
                    setBillingSubView('create');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem 1.25rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  <Plus size={18} />
                  <span>Create New Final Bill</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentSection('billing');
                    setBillingSubView('history');
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                >
                  <Receipt size={16} />
                  <span>Billing History ({invoices.length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 1 WORKSPACE: QUOTATION                                             */}
      {/* ========================================================================= */}
      {currentSection === 'quotation' && (
        <div>
          {/* Top Navigation & Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentSection('cards')}
                className="btn btn-secondary btn-sm"
                title="Return to the 2 Main Options"
              >
                <ArrowLeft size={16} />
                <span>Back to 2 Main Cards</span>
              </button>

              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#0284c7" />
                  <span>Quotation Module</span>
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Draft estimates, manage items, generate branded A4 PDFs
                </div>
              </div>
            </div>

            {/* Sub-view toggles */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setQuotationSubView('create')}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: quotationSubView === 'create' ? '#ffffff' : 'transparent',
                  color: quotationSubView === 'create' ? '#0284c7' : '#64748b',
                  boxShadow: quotationSubView === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                + Create Quotation
              </button>

              <button
                onClick={() => setQuotationSubView('history')}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: quotationSubView === 'history' ? '#ffffff' : 'transparent',
                  color: quotationSubView === 'history' ? '#0284c7' : '#64748b',
                  boxShadow: quotationSubView === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Quotation History ({quotations.length})
              </button>
            </div>
          </div>

          {/* QUOTATION: CREATE NEW FORM */}
          {quotationSubView === 'create' && (
            <div className="tech-card" style={{ background: '#ffffff', padding: '2rem', borderRadius: '14px' }}>
              <form onSubmit={handleSaveQuotation}>
                
                {/* Meta row: Quotation Number, Date, Valid Date, Status */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Quotation Number
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input 
                        type="text"
                        value={quotationForm.quotationNumber}
                        onChange={(e) => setQuotationForm({ ...quotationForm, quotationNumber: e.target.value })}
                        className="form-input"
                        style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setQuotationForm({ ...quotationForm, quotationNumber: getNextQuotationNumber(quotations) })}
                        title="Regenerate unique quotation number"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 0.5rem',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Quotation Date
                    </label>
                    <input 
                      type="date"
                      value={quotationForm.date}
                      onChange={(e) => setQuotationForm({ ...quotationForm, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Valid Until
                    </label>
                    <input 
                      type="date"
                      value={quotationForm.validUntil}
                      onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Quotation Status
                    </label>
                    <select
                      value={quotationForm.status}
                      onChange={(e) => setQuotationForm({ ...quotationForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Sent">Sent</option>
                      <option value="Draft">Draft</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details Block */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={18} color="#0284c7" />
                    <span>Customer & Client Details</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label required">Customer / Contact Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Dr. Arvind Ramesh"
                        value={quotationForm.customerName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, customerName: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company / Institution / College</label>
                      <input 
                        type="text"
                        placeholder="e.g. Apex Hospital / PSG Tech"
                        value={quotationForm.companyName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, companyName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }} className="grid-cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email"
                        placeholder="client@example.com"
                        value={quotationForm.email}
                        onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text"
                        placeholder="+91 98450 12345"
                        value={quotationForm.phone}
                        onChange={(e) => setQuotationForm({ ...quotationForm, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Client Address / Site Location</label>
                      <input 
                        type="text"
                        placeholder="City, State, Pin Code"
                        value={quotationForm.address}
                        onChange={(e) => setQuotationForm({ ...quotationForm, address: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Product / Service Items Section */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={18} color="#0284c7" />
                      <span>Product / Service Line Items ({quotationForm.items.length})</span>
                    </h4>

                    {/* Dynamic + Add Item button */}
                    <button
                      type="button"
                      onClick={handleAddQuotationItem}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#0284c7', borderColor: '#7dd3fc', background: '#f0f9ff' }}
                    >
                      <Plus size={15} />
                      <span>+ Add Item</span>
                    </button>
                  </div>

                  {/* Items Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem', width: '40px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '0.75rem' }}>Product / Service Description</th>
                          <th style={{ padding: '0.75rem', width: '90px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '0.75rem', width: '130px', textAlign: 'right' }}>Price (₹)</th>
                          <th style={{ padding: '0.75rem', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                          <th style={{ padding: '0.75rem', width: '50px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotationForm.items.map((item, index) => {
                          const itemTotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
                          return (
                            <tr key={item.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                {index + 1}
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="text"
                                  placeholder="e.g. ESP32 Industrial Telemetry Hub with OLED & LoRa"
                                  value={item.description}
                                  onChange={(e) => handleQuotationItemChange(index, 'description', e.target.value)}
                                  className="form-input"
                                  style={{ padding: '0.45rem 0.7rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuotationItemChange(index, 'quantity', e.target.value)}
                                  className="form-input"
                                  style={{ textAlign: 'center', padding: '0.45rem 0.5rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.unitPrice}
                                  onChange={(e) => handleQuotationItemChange(index, 'unitPrice', e.target.value)}
                                  className="form-input"
                                  style={{ textAlign: 'right', padding: '0.45rem 0.7rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                {itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuotationItem(index)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleAddQuotationItem}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#0284c7' }}
                    >
                      <Plus size={15} />
                      <span>+ Add Another Item</span>
                    </button>
                  </div>
                </div>

                {/* Calculation & Terms Section */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr',
                  gap: '1.5rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '2rem'
                }} className="grid-cols-2">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      Quotation Terms & Engineering Notes
                    </label>
                    <textarea 
                      rows={4}
                      value={quotationForm.notes}
                      onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                      className="form-textarea"
                      placeholder="Payment terms, warranty, lead time..."
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Financial Summary (Strictly NO GST or TAX) */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #0284c7',
                      borderRadius: '8px',
                      padding: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>TOTAL QUOTATION:</span>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0284c7' }}>
                          {formatINR(quotationCalculatedTotal)}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                        {numberToWords(quotationCalculatedTotal)}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '0.5rem' }}>
                        ✓ Pure Commercial Estimate (No GST / Taxes Added)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setQuotationForm(getInitialQuotationForm())}
                    className="btn btn-outline btn-sm"
                  >
                    <RotateCcw size={15} />
                    <span>Reset Form</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Live Preview Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...quotationForm,
                          totalAmount: quotationCalculatedTotal,
                          items: quotationForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        setPreviewDoc({ type: 'quotation', data: payload });
                      }}
                      className="btn btn-secondary"
                    >
                      <Eye size={16} />
                      <span>Preview A4</span>
                    </button>

                    {/* Quick Print Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...quotationForm,
                          totalAmount: quotationCalculatedTotal,
                          items: quotationForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        setPreviewDoc({ type: 'quotation', data: payload });
                        setTimeout(() => window.print(), 350);
                      }}
                      className="btn btn-secondary"
                    >
                      <Printer size={16} />
                      <span>Print Quotation</span>
                    </button>

                    {/* Quick Download PDF Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...quotationForm,
                          totalAmount: quotationCalculatedTotal,
                          items: quotationForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        generateQuotationPDF(payload, true);
                      }}
                      className="btn btn-secondary"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>

                    {/* Save to Database Button */}
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <Save size={16} />
                      <span>Save Quotation</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* QUOTATION: HISTORY TABLE */}
          {quotationSubView === 'history' && (
            <div className="tech-card" style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '14px' }}>
              
              {/* Filter & Search Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text"
                      placeholder="Search by quote # or customer name..."
                      value={quotationSearch}
                      onChange={(e) => setQuotationSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <select
                    value={quotationStatusFilter}
                    onChange={(e) => setQuotationStatusFilter(e.target.value)}
                    className="form-select"
                    style={{ width: '140px', fontSize: '0.88rem' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Draft">Draft</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <button
                  onClick={() => setQuotationSubView('create')}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={15} />
                  <span>+ New Quotation</span>
                </button>
              </div>

              {/* History Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem' }}>Quotation #</th>
                      <th style={{ padding: '0.75rem' }}>Customer / Organization</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Valid Till</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Items</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((q) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                          {q.quotationNumber}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{q.customerName}</div>
                          {q.companyName && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.companyName}</div>}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                          {q.date}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
                          {q.validUntil}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                          {(q.items || []).length}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {formatINR(q.totalAmount)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: q.status === 'Accepted' ? '#dcfce7' : (q.status === 'Draft' ? '#f1f5f9' : '#e0f2fe'),
                            color: q.status === 'Accepted' ? '#15803d' : (q.status === 'Draft' ? '#64748b' : '#0369a1')
                          }}>
                            {q.status || 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => setPreviewDoc({ type: 'quotation', data: q })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              title="Preview A4 Document"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setPreviewDoc({ type: 'quotation', data: q });
                                setTimeout(() => window.print(), 350);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              title="Print A4 Quotation"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => generateQuotationPDF(q, true)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              title="Delete Quotation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredQuotations.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 600 }}>No quotation records found.</p>
                    <button
                      onClick={() => setQuotationSubView('create')}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '0.75rem' }}
                    >
                      <Plus size={15} />
                      <span>Create Quotation Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2 WORKSPACE: BILLING                                               */}
      {/* ========================================================================= */}
      {currentSection === 'billing' && (
        <div>
          {/* Top Navigation & Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentSection('cards')}
                className="btn btn-secondary btn-sm"
                title="Return to the 2 Main Options"
              >
                <ArrowLeft size={16} />
                <span>Back to 2 Main Cards</span>
              </button>

              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Receipt size={20} color="#2563eb" />
                  <span>Final Commercial Billing Module</span>
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Issue final bills, apply discounts, track payments, export A4 PDFs
                </div>
              </div>
            </div>

            {/* Sub-view toggles */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setBillingSubView('create')}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: billingSubView === 'create' ? '#ffffff' : 'transparent',
                  color: billingSubView === 'create' ? '#2563eb' : '#64748b',
                  boxShadow: billingSubView === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                + Create Final Bill
              </button>

              <button
                onClick={() => setBillingSubView('history')}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: billingSubView === 'history' ? '#ffffff' : 'transparent',
                  color: billingSubView === 'history' ? '#2563eb' : '#64748b',
                  boxShadow: billingSubView === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Billing History ({invoices.length})
              </button>
            </div>
          </div>

          {/* BILLING: CREATE NEW FINAL BILL FORM */}
          {billingSubView === 'create' && (
            <div className="tech-card" style={{ background: '#ffffff', padding: '2rem', borderRadius: '14px' }}>
              <form onSubmit={handleSaveInvoice}>
                
                {/* Meta row: Invoice Number, Date, Due Date, Payment Status */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Invoice / Bill Number
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input 
                        type="text"
                        value={billingForm.invoiceNumber}
                        onChange={(e) => setBillingForm({ ...billingForm, invoiceNumber: e.target.value })}
                        className="form-input"
                        style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setBillingForm({ ...billingForm, invoiceNumber: getNextInvoiceNumber(invoices) })}
                        title="Regenerate unique invoice number"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 0.5rem',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Invoice Date
                    </label>
                    <input 
                      type="date"
                      value={billingForm.date}
                      onChange={(e) => setBillingForm({ ...billingForm, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Due Date
                    </label>
                    <input 
                      type="date"
                      value={billingForm.dueDate}
                      onChange={(e) => setBillingForm({ ...billingForm, dueDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Payment Status
                    </label>
                    <select
                      value={billingForm.paymentStatus}
                      onChange={(e) => setBillingForm({ ...billingForm, paymentStatus: e.target.value })}
                      className="form-select"
                      style={{
                        fontWeight: 700,
                        color: billingForm.paymentStatus === 'Paid' ? '#15803d' : '#b45309'
                      }}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details Block */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={18} color="#2563eb" />
                    <span>Customer & Billing Information</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label required">Customer / Client Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Karthik Subramanian"
                        value={billingForm.customerName}
                        onChange={(e) => setBillingForm({ ...billingForm, customerName: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company / Organization Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. CyberMesh Dynamics Pvt Ltd"
                        value={billingForm.companyName}
                        onChange={(e) => setBillingForm({ ...billingForm, companyName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }} className="grid-cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email"
                        placeholder="finance@client.com"
                        value={billingForm.email}
                        onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text"
                        placeholder="+91 94441 53974"
                        value={billingForm.phone}
                        onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Client Billing Address</label>
                      <input 
                        type="text"
                        placeholder="Office / Campus Address"
                        value={billingForm.address}
                        onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Payment Mode & Reference */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem', marginTop: '1rem' }} className="grid-cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Payment Mode</label>
                      <select
                        value={billingForm.paymentMode}
                        onChange={(e) => setBillingForm({ ...billingForm, paymentMode: e.target.value })}
                        className="form-select"
                      >
                        <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                        <option value="UPI / QR Code">UPI / QR Code (GPay, PhonePe)</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Credit / Debit Card</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Transaction / UTR Reference ID (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. UTR-994821035 / UPI-Ref-001"
                        value={billingForm.transactionRef}
                        onChange={(e) => setBillingForm({ ...billingForm, transactionRef: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Unlimited Products / Services dynamic table */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Receipt size={18} color="#2563eb" />
                      <span>Billed Products & Services ({billingForm.items.length})</span>
                    </h4>

                    {/* Dynamic + Add Item button */}
                    <button
                      type="button"
                      onClick={handleAddBillingItem}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#2563eb', borderColor: '#93c5fd', background: '#eff6ff' }}
                    >
                      <Plus size={15} />
                      <span>+ Add Item</span>
                    </button>
                  </div>

                  {/* Items Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem', width: '40px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '0.75rem' }}>Product / Service Details</th>
                          <th style={{ padding: '0.75rem', width: '90px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '0.75rem', width: '130px', textAlign: 'right' }}>Price (₹)</th>
                          <th style={{ padding: '0.75rem', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                          <th style={{ padding: '0.75rem', width: '50px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingForm.items.map((item, index) => {
                          const itemTotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
                          return (
                            <tr key={item.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                {index + 1}
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="text"
                                  placeholder="e.g. 4-Layer High-Density BLDC Motor Controller PCB Batch"
                                  value={item.description}
                                  onChange={(e) => handleBillingItemChange(index, 'description', e.target.value)}
                                  className="form-input"
                                  style={{ padding: '0.45rem 0.7rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleBillingItemChange(index, 'quantity', e.target.value)}
                                  className="form-input"
                                  style={{ textAlign: 'center', padding: '0.45rem 0.5rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <input 
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.unitPrice}
                                  onChange={(e) => handleBillingItemChange(index, 'unitPrice', e.target.value)}
                                  className="form-input"
                                  style={{ textAlign: 'right', padding: '0.45rem 0.7rem' }}
                                  required
                                />
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                {itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBillingItem(index)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleAddBillingItem}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#2563eb' }}
                    >
                      <Plus size={15} />
                      <span>+ Add Another Item</span>
                    </button>
                  </div>
                </div>

                {/* Calculation, Discount & Terms Section (Strictly NO GST or TAX) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1fr',
                  gap: '1.5rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '2rem'
                }} className="grid-cols-2">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      Invoice Terms & Remittance Notes
                    </label>
                    <textarea 
                      rows={4}
                      value={billingForm.notes}
                      onChange={(e) => setBillingForm({ ...billingForm, notes: e.target.value })}
                      className="form-textarea"
                      placeholder="Payment details, receipt notes, warranty..."
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Automatic Calculations: Subtotal, Discount & Final Amount */}
                  <div>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b' }}>Subtotal:</span>
                        <strong style={{ color: '#0f172a' }}>{formatINR(billingSubtotal)}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <label htmlFor="discount-input" style={{ color: '#64748b', cursor: 'pointer' }}>Flat Discount (₹):</label>
                        <input 
                          id="discount-input"
                          type="number"
                          min="0"
                          step="any"
                          value={billingForm.discount}
                          onChange={(e) => setBillingForm({ ...billingForm, discount: e.target.value })}
                          className="form-input"
                          style={{ width: '120px', textAlign: 'right', padding: '0.35rem 0.5rem', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderTop: '2px solid #2563eb',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>FINAL AMOUNT:</span>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb' }}>
                          {formatINR(billingFinalAmount)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                        {numberToWords(billingFinalAmount)}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '0.5rem' }}>
                        ✓ Pure Commercial Bill (No GST / Taxes Added)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setBillingForm(getInitialBillingForm())}
                    className="btn btn-outline btn-sm"
                  >
                    <RotateCcw size={15} />
                    <span>Reset Form</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Live Preview Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...billingForm,
                          subtotal: billingSubtotal,
                          discount: billingDiscount,
                          finalAmount: billingFinalAmount,
                          items: billingForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        setPreviewDoc({ type: 'billing', data: payload });
                      }}
                      className="btn btn-secondary"
                    >
                      <Eye size={16} />
                      <span>Preview A4</span>
                    </button>

                    {/* Quick Print Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...billingForm,
                          subtotal: billingSubtotal,
                          discount: billingDiscount,
                          finalAmount: billingFinalAmount,
                          items: billingForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        setPreviewDoc({ type: 'billing', data: payload });
                        setTimeout(() => window.print(), 350);
                      }}
                      className="btn btn-secondary"
                    >
                      <Printer size={16} />
                      <span>Print Final Bill</span>
                    </button>

                    {/* Quick Download PDF Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const payload = {
                          ...billingForm,
                          subtotal: billingSubtotal,
                          discount: billingDiscount,
                          finalAmount: billingFinalAmount,
                          items: billingForm.items.map(it => ({
                            ...it,
                            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
                          }))
                        };
                        generateBillingPDF(payload, true);
                      }}
                      className="btn btn-secondary"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>

                    {/* Save to Database Button */}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                    >
                      <Save size={16} />
                      <span>Save Final Bill</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* BILLING: HISTORY TABLE */}
          {billingSubView === 'history' && (
            <div className="tech-card" style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '14px' }}>
              
              {/* Filter & Search Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text"
                      placeholder="Search by invoice # or customer name..."
                      value={billingSearch}
                      onChange={(e) => setBillingSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <select
                    value={billingStatusFilter}
                    onChange={(e) => setBillingStatusFilter(e.target.value)}
                    className="form-select"
                    style={{ width: '140px', fontSize: '0.88rem' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <button
                  onClick={() => setBillingSubView('create')}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  <Plus size={15} />
                  <span>+ New Final Bill</span>
                </button>
              </div>

              {/* History Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem' }}>Invoice #</th>
                      <th style={{ padding: '0.75rem' }}>Customer / Company</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Payment Mode</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Subtotal</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Discount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Final Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => {
                      const isPaid = (inv.paymentStatus || '').toLowerCase() === 'paid';
                      return (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                            {inv.invoiceNumber}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.customerName}</div>
                            {inv.companyName && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{inv.companyName}</div>}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                            {inv.date}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
                            {inv.paymentMode || 'Direct'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                            {formatINR(inv.subtotal)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: inv.discount > 0 ? '#dc2626' : '#94a3b8' }}>
                            {inv.discount > 0 ? `- ${formatINR(inv.discount)}` : '₹0.00'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {formatINR(inv.finalAmount)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleInvoiceStatus(inv)}
                              title="Click to toggle Paid/Pending"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                border: 'none',
                                cursor: 'pointer',
                                background: isPaid ? '#dcfce7' : '#fef3c7',
                                color: isPaid ? '#15803d' : '#b45309'
                              }}
                            >
                              {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                              <span>{inv.paymentStatus || 'Pending'}</span>
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => setPreviewDoc({ type: 'billing', data: inv })}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.3rem 0.55rem' }}
                                title="Preview A4 Document"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewDoc({ type: 'billing', data: inv });
                                  setTimeout(() => window.print(), 350);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.3rem 0.55rem' }}
                                title="Print A4 Bill"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => generateBillingPDF(inv, true)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.3rem 0.55rem' }}
                                title="Download PDF"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.3rem 0.55rem' }}
                                title="Delete Bill"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredInvoices.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Receipt size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 600 }}>No final billing records found.</p>
                    <button
                      onClick={() => setBillingSubView('create')}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '0.75rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                    >
                      <Plus size={15} />
                      <span>Create Final Bill Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-FIDELITY A4 DOCUMENT PREVIEW MODAL                                   */}
      {/* ========================================================================= */}
      {previewDoc && (
        <A4DocumentPreview 
          type={previewDoc.type}
          data={previewDoc.data}
          onClose={() => setPreviewDoc(null)}
        />
      )}

    </div>
  );
};

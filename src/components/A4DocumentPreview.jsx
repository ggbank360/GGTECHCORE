import React, { useState } from 'react';
import { Printer, Download, X, CheckCircle, Clock, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { generateQuotationPDF, generateBillingPDF } from '../utils/pdfGenerator';
import { numberToWords, formatINR } from '../utils/numberToWords';
import logoImg from '../assets/logo.png';

// Reliable print helper that avoids modal overlay clipping or blank page issues in Chromium
const printIframeDocument = (elementId, title = 'GG TECHCORE Document') => {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-sheet-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10mm 12mm !important;
            margin: 0 auto !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
        </style>
      </head>
      <body>
        <div class="a4-sheet-container">
          ${el.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 400);
};

export const A4DocumentPreview = ({ type = 'quotation', data, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 0.88 = fit, etc.

  if (!data) return null;

  const isQuotation = type === 'quotation';
  const docNumber = isQuotation ? data.quotationNumber : data.invoiceNumber;
  const docTitle = isQuotation ? 'COMMERCIAL QUOTATION' : 'FINAL BILL / COMMERCIAL INVOICE';
  const themeColor = isQuotation ? '#0284c7' : '#2563eb';
  const docDate = data.date || (data.createdAt ? String(data.createdAt).split('T')[0] : 'Current');

  // Company Details
  const companyName = data.companyNameHeader || data.companyDetails?.companyName || 'GG TECHCORE';
  const companyTagline = data.companyTagline || data.companyDetails?.tagline || 'ENGINEERING IDEAS INTO REALITY';
  const companyAddress = data.companyAddress || data.companyDetails?.address || 'TechCore Engineering Park, Electronics Innovation Hub, Coimbatore, Tamil Nadu - 641014, India';
  const companyPhone = data.companyPhone || data.companyDetails?.phone || '+91 77089 49507 / +91 63744 31113';
  const companyEmail = data.companyEmail || data.companyDetails?.email || 'ggbank360@gmail.com';

  // Signatory Details
  const signatoryName = data.signatoryName || data.companyDetails?.signatoryName || 'GOWTHAM N K';
  const signatoryTitle = data.signatoryTitle || data.companyDetails?.signatoryTitle || (isQuotation ? 'Authorized Engineering Lab Signatory' : 'Authorized Commercial Finance Signatory');

  // Bank & Remittance details
  const bankName = data.bankName || data.companyDetails?.bankName || 'HDFC Bank';
  const accountName = data.accountName || data.companyDetails?.accountName || 'GG TECHCORE';
  const accountNumber = data.accountNumber || data.companyDetails?.accountNumber || '50200084920192';
  const ifscCode = data.ifscCode || data.companyDetails?.ifscCode || 'HDFC0001234';
  const upiId = data.upiId || data.companyDetails?.upiId || 'ggbank360@okaxis';

  // Calculations
  const items = data.items || [];
  let calculatedSubtotal = 0;
  items.forEach(it => {
    calculatedSubtotal += (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
  });

  const subtotal = isQuotation 
    ? (Number(data.totalAmount) || calculatedSubtotal) 
    : (Number(data.subtotal) || calculatedSubtotal);

  const discount = isQuotation ? 0 : (Number(data.discount) || 0);
  const finalTotal = Math.max(0, subtotal - discount);

  // Handle Download PDF
  const handleDownload = () => {
    if (isQuotation) {
      generateQuotationPDF(data, true);
    } else {
      generateBillingPDF(data, true);
    }
  };

  // Handle Print via isolated frame
  const handlePrint = () => {
    printIframeDocument('a4-print-sheet', `${companyName}_${docNumber}`);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        zIndex: 9999, 
        padding: '0.75rem',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '960px', 
          width: '100%', 
          maxHeight: '96vh',
          background: '#0f172a', 
          borderRadius: '16px',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          flexWrap: 'wrap',
          gap: '0.75rem',
          zIndex: 10
        }}>
          {/* Doc Title & Sequence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              background: themeColor,
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              {isQuotation ? 'QUOTATION' : 'FINAL BILL'}
            </span>
            <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', fontFamily: 'monospace' }}>
              {docNumber}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              ({data.customerName || 'Draft'})
            </span>
          </div>

          {/* Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '6px', border: '1px solid #334155', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.65, prev - 0.1))}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '4px 6px', cursor: 'pointer', display: 'flex' }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.74rem', fontWeight: 700, padding: '2px 6px', cursor: 'pointer' }}
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '4px 6px', cursor: 'pointer', display: 'flex' }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.88)}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderLeft: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                title="Fit Width"
              >
                <Maximize2 size={12} />
                <span>Fit</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff', color: '#0f172a', fontWeight: 700, padding: '0.4rem 0.85rem' }}
              title="Print A4 Document"
            >
              <Printer size={15} />
              <span>Print A4</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownload}
              className="btn btn-primary btn-sm"
              style={{ background: themeColor, borderColor: themeColor, padding: '0.4rem 0.85rem' }}
              title="Download Vector PDF"
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Outer Scroll Container for A4 Sheet with responsive auto-centering */}
        <div style={{
          flex: '1 1 auto',
          padding: '1.5rem 1rem',
          background: '#334155',
          overflowY: 'auto',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          
          {/* Zoom Wrapper */}
          <div style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: '100%',
            maxWidth: '820px',
            display: 'flex',
            justifyContent: 'center'
          }}>

            {/* Authentic A4 Paper Sheet */}
            <div 
              id="a4-print-sheet"
              style={{
                width: '100%',
                maxWidth: '794px', /* Standard A4 210mm in 96dpi pixels */
                minHeight: '1050px',
                background: '#ffffff',
                color: '#0f172a',
                boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                borderRadius: '4px',
                padding: '36px 42px',
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {/* Top Brand Accent Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: themeColor,
                borderRadius: '4px 4px 0 0'
              }} />

              {/* Header Section: Logo, Company Name, Tagline & Official Company Address */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', gap: '1rem' }}>
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <img 
                      src={logoImg} 
                      alt={companyName} 
                      style={{ height: '46px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <div>
                      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.03em', lineHeight: 1.1 }}>
                        {companyName}
                      </h1>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: themeColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {companyTagline}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginTop: '0.45rem' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      📍 {companyAddress}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      Official Email: <strong style={{ color: '#0f172a' }}>{companyEmail}</strong> &bull; Contact: <strong style={{ color: '#0f172a' }}>{companyPhone}</strong>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      Hardware Prototyping &bull; Embedded Systems &bull; IoT Telemetry &bull; Robotics Lab
                    </div>
                  </div>
                </div>

                {/* Document Type Badge & Metadata */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    display: 'inline-block',
                    background: isQuotation ? '#e0f2fe' : '#eff6ff',
                    color: themeColor,
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    letterSpacing: '0.06em',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${isQuotation ? '#bae6fd' : '#bfdbfe'}`,
                    marginBottom: '0.65rem',
                    textTransform: 'uppercase'
                  }}>
                    {docTitle}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                    <div><span style={{ fontWeight: 600, color: '#334155' }}>Doc #:</span> <strong style={{ color: themeColor, fontFamily: 'monospace', fontSize: '0.95rem' }}>{docNumber}</strong></div>
                    <div><span style={{ fontWeight: 600, color: '#334155' }}>Date:</span> {docDate}</div>
                    {isQuotation ? (
                      <div><span style={{ fontWeight: 600, color: '#334155' }}>Valid Till:</span> {data.validUntil || '30 Days from date'}</div>
                    ) : (
                      <div><span style={{ fontWeight: 600, color: '#334155' }}>Due Date:</span> {data.dueDate || 'Upon Receipt'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Document Meta Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '1rem',
                margin: '1rem 0',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1.15rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: themeColor, marginBottom: '0.3rem' }}>
                    {isQuotation ? 'Quoted To (Client)' : 'Billed To (Customer Details)'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {data.customerName || 'Customer / Client Name'}
                  </div>
                  {data.companyName && (
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                      {data.companyName}
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    {data.address || 'Address: Tamil Nadu, India'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                    <span>Phone: <strong>{data.phone || 'N/A'}</strong></span> &bull; <span>Email: <strong>{data.email || 'N/A'}</strong></span>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: themeColor, marginBottom: '0.3rem' }}>
                    Invoice & Payment Parameters
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Currency:</span>
                      <strong style={{ color: '#0f172a' }}>INR (Indian Rupee - ₹)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Taxation:</span>
                      <strong style={{ color: '#16a34a' }}>Tax Exempt (0% GST Pure Bill)</strong>
                    </div>
                    {isQuotation ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Status:</span>
                        <strong style={{ color: data.status === 'Accepted' ? '#16a34a' : themeColor }}>
                          {data.status || 'Active'}
                        </strong>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Payment Mode:</span>
                          <strong style={{ color: '#0f172a' }}>{data.paymentMode || 'Bank Transfer'}</strong>
                        </div>
                        {data.transactionRef && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Txn / UTR Ref:</span>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{data.transactionRef}</strong>
                          </div>
                        )}
                        {data.poNumber && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>PO / Ref No:</span>
                            <strong style={{ color: '#0f172a' }}>{data.poNumber}</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ color: '#64748b' }}>Payment Status:</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: (data.paymentStatus || '').toLowerCase() === 'paid' ? '#dcfce7' : '#fef3c7',
                            color: (data.paymentStatus || '').toLowerCase() === 'paid' ? '#15803d' : '#b45309'
                          }}>
                            {(data.paymentStatus || '').toLowerCase() === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {(data.paymentStatus || 'Pending').toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Table of Products / Services */}
              <div style={{ flex: '1 0 auto', margin: '0.5rem 0 1.25rem 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.75rem', width: '36px', textAlign: 'center', borderRadius: '4px 0 0 0' }}>#</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Description of Product / Service & Technical Specs</th>
                      <th style={{ padding: '0.6rem 0.75rem', width: '65px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '0.6rem 0.75rem', width: '110px', textAlign: 'right' }}>Price (₹)</th>
                      <th style={{ padding: '0.6rem 0.75rem', width: '120px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const qty = Number(item.quantity) || 1;
                      const price = Number(item.unitPrice) || 0;
                      const total = Number(item.total) || (qty * price);
                      return (
                        <tr 
                          key={item.id || idx}
                          style={{
                            background: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                            borderBottom: '1px solid #e2e8f0'
                          }}
                        >
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.45 }}>
                            {item.description || 'Custom Engineering Service'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#334155', fontWeight: 600 }}>{qty}</td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                            {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic', border: '1px dashed #cbd5e1', borderRadius: '6px', marginTop: '0.5rem' }}>
                    No line items listed in this document.
                  </div>
                )}
              </div>

              {/* Calculations & Totals (Strictly No GST or Tax calculations) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                
                {/* Left Column: Amount In Words & Remittance Box */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.65rem 0.95rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Amount in Words
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', fontStyle: 'italic', marginTop: '2px' }}>
                      {numberToWords(finalTotal)}
                    </div>
                  </div>

                  {!isQuotation && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '0.65rem 0.95rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Bank Remittance & Payment Details
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '3px', lineHeight: 1.45 }}>
                        <div><strong>Bank:</strong> {bankName} &bull; <strong>Account:</strong> {accountName}</div>
                        <div><strong>A/C No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{accountNumber}</span> &bull; <strong>IFSC:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ifscCode}</span></div>
                        <div><strong>UPI ID:</strong> <span style={{ fontWeight: 700 }}>{upiId}</span> (GPay, PhonePe, Paytm)</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Financial Summary Table */}
                <div style={{ width: '280px' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {isQuotation ? (
                      <div style={{
                        padding: '0.85rem 1.15rem',
                        background: '#f0f9ff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>TOTAL QUOTE:</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: themeColor }}>
                          {formatINR(finalTotal)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ padding: '0.6rem 0.95rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
                          <span style={{ color: '#64748b' }}>Subtotal:</span>
                          <strong style={{ color: '#0f172a' }}>{formatINR(subtotal)}</strong>
                        </div>
                        <div style={{ padding: '0.6rem 0.95rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
                          <span style={{ color: '#64748b' }}>Discount Applied:</span>
                          <strong style={{ color: discount > 0 ? '#dc2626' : '#64748b' }}>- {formatINR(discount)}</strong>
                        </div>
                        <div style={{
                          padding: '0.75rem 0.95rem',
                          background: '#eff6ff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '2px solid #2563eb'
                        }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>FINAL AMOUNT:</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>
                            {formatINR(finalTotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions & Signatory */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: themeColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                      Terms & Commercial Conditions
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                      {data.notes || (isQuotation ? (
                        '1. Quotation valid for 30 days from date of issuance.\n' +
                        '2. Standard payment milestone: 50% advance along with PO, 50% on hardware demonstration.\n' +
                        '3. All electronics hardware covered under standard 1-year laboratory prototyping warranty.'
                      ) : (
                        '1. Final commercial bill issued without GST / local tax calculations.\n' +
                        '2. Payment is due as per agreed milestone terms.\n' +
                        '3. For electronic transfers, please share transaction reference to ggbank360@gmail.com.'
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '0.45rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      For {companyName}
                    </div>
                    <div style={{ height: '14px' }} />
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {signatoryName}
                    </div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: themeColor, marginTop: '2px' }}>
                      {signatoryTitle}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      (Digitally Verified & Authorized)
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Color Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: themeColor,
                borderRadius: '0 0 4px 4px'
              }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

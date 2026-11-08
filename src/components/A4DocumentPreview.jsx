import React from 'react';
import { Printer, Download, X, CheckCircle, Clock } from 'lucide-react';
import { generateQuotationPDF, generateBillingPDF } from '../utils/pdfGenerator';
import { numberToWords, formatINR } from '../utils/numberToWords';
import logoImg from '../assets/logo.png';

export const A4DocumentPreview = ({ type = 'quotation', data, onClose }) => {
  if (!data) return null;

  const isQuotation = type === 'quotation';
  const docNumber = isQuotation ? data.quotationNumber : data.invoiceNumber;
  const docTitle = isQuotation ? 'COMMERCIAL QUOTATION' : 'FINAL BILL / COMMERCIAL INVOICE';
  const themeColor = isQuotation ? '#0284c7' : '#2563eb';
  const docDate = data.date || (data.createdAt ? String(data.createdAt).split('T')[0] : 'Current');

  // Handle Download PDF
  const handleDownload = () => {
    if (isQuotation) {
      generateQuotationPDF(data, true);
    } else {
      generateBillingPDF(data, true);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="modal-overlay a4-preview-overlay" onClick={onClose} style={{ zIndex: 9999, overflowY: 'auto', padding: '1rem' }}>
      {/* Print styles injected for clean A4 printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #a4-print-sheet, #a4-print-sheet * {
            visibility: visible !important;
          }
          #a4-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '920px', 
          width: '100%', 
          background: '#0f172a', 
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              background: themeColor,
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              {isQuotation ? 'QUOTATION' : 'FINAL BILL'}
            </span>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
              {docNumber}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              ({data.customerName})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff', color: '#0f172a', fontWeight: 700 }}
              title="Print A4 Document"
            >
              <Printer size={16} />
              <span>Print A4</span>
            </button>

            <button
              onClick={handleDownload}
              className="btn btn-primary btn-sm"
              style={{ background: themeColor, borderColor: themeColor }}
              title="Download PDF"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>

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
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Outer scroll area for the A4 sheet */}
        <div style={{ padding: '2rem 1.5rem', background: '#334155', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
          
          {/* A4 Paper Container */}
          <div 
            id="a4-print-sheet"
            style={{
              width: '210mm',
              minHeight: '297mm',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              borderRadius: '4px',
              padding: '16mm 18mm',
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
              background: themeColor
            }} />

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <img 
                    src={logoImg} 
                    alt="GG TECHCORE" 
                    style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
                  />
                  <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                      GG TECHCORE
                    </h1>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: themeColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Engineering Ideas Into Reality
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45, marginTop: '0.5rem' }}>
                  <div>TechCore Engineering Park, Electronics Innovation Hub, Coimbatore, India</div>
                  <div>Official Email: <strong style={{ color: '#334155' }}>ggbank360@gmail.com</strong> | Lab: <strong style={{ color: '#334155' }}>+91 77089 49507</strong></div>
                  <div>Hardware Prototyping | Embedded Systems | IoT & Robotics Lab</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block',
                  background: isQuotation ? '#e0f2fe' : '#eef2ff',
                  color: themeColor,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.06em',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: `1px solid ${isQuotation ? '#bae6fd' : '#c7d2fe'}`,
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase'
                }}>
                  {docTitle}
                </div>

                <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  <div><span style={{ fontWeight: 600, color: '#334155' }}>Doc #:</span> <strong style={{ color: themeColor }}>{docNumber}</strong></div>
                  <div><span style={{ fontWeight: 600, color: '#334155' }}>Date:</span> {docDate}</div>
                  {isQuotation ? (
                    <div><span style={{ fontWeight: 600, color: '#334155' }}>Valid Until:</span> {data.validUntil || '30 Days from date'}</div>
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
              margin: '1.25rem 0',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem 1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: themeColor, marginBottom: '0.35rem' }}>
                  {isQuotation ? 'Quoted To (Client)' : 'Billed To (Client)'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {data.customerName || 'Customer / Client Name'}
                </div>
                {data.companyName && (
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                    {data.companyName}
                  </div>
                )}
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  {data.address || 'Address / Location not specified'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                  <span>Phone: {data.phone || 'N/A'}</span> &bull; <span>Email: {data.email || 'N/A'}</span>
                </div>
              </div>

              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: themeColor, marginBottom: '0.35rem' }}>
                  Transaction Parameters
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Currency:</span>
                    <strong style={{ color: '#0f172a' }}>INR (Indian Rupee - ₹)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Taxation:</span>
                    <strong style={{ color: '#16a34a' }}>Tax Exempt / Pure Commercial (0% GST)</strong>
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
                        <strong style={{ color: '#0f172a' }}>{data.paymentMode || 'Direct Transfer'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Payment Status:</span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.78rem',
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

            {/* Product / Service Items Table */}
            <div style={{ flex: '1 0 auto', margin: '0.5rem 0 1.5rem 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.75rem', width: '38px', textAlign: 'center', borderRadius: '4px 0 0 0' }}>#</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Description of Product / Service</th>
                    <th style={{ padding: '0.65rem 0.75rem', width: '70px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.65rem 0.75rem', width: '110px', textAlign: 'right' }}>Unit Price (₹)</th>
                    <th style={{ padding: '0.65rem 0.75rem', width: '120px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Total (₹)</th>
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
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#1e293b', fontWeight: 500 }}>
                          {item.description || 'Custom Engineering Item'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#334155' }}>{qty}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                          {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              
              {/* Left Column: Amount In Words & Bank Details */}
              <div style={{ flex: '1 1 300px' }}>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Amount in Words
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', fontStyle: 'italic', marginTop: '2px' }}>
                    {numberToWords(finalTotal)}
                  </div>
                </div>

                {!isQuotation && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Remittance / Bank Transfer Info
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '3px', lineHeight: 1.4 }}>
                      <div><strong>Account:</strong> GG TECHCORE Lab Solutions</div>
                      <div><strong>Account No:</strong> 50200084920192 &bull; <strong>IFSC:</strong> HDFC0001234</div>
                      <div><strong>UPI ID:</strong> ggbank360@okaxis (GPay / PhonePe)</div>
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
                      padding: '1rem 1.25rem',
                      background: '#f0f9ff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>TOTAL QUOTE:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: themeColor }}>
                        {formatINR(finalTotal)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#64748b' }}>Subtotal:</span>
                        <strong style={{ color: '#0f172a' }}>{formatINR(subtotal)}</strong>
                      </div>
                      <div style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#64748b' }}>Discount Applied:</span>
                        <strong style={{ color: discount > 0 ? '#dc2626' : '#64748b' }}>- {formatINR(discount)}</strong>
                      </div>
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: '#eff6ff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '2px solid #2563eb'
                      }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>FINAL AMOUNT:</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>
                          {formatINR(finalTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: themeColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    Terms & Commercial Conditions
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
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

                <div style={{ textAlign: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    For GG TECHCORE
                  </div>
                  <div style={{ height: '32px' }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    Authorized Engineering Lab Signatory
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    (Computer Generated Valid Document)
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
              background: themeColor
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

import { jsPDF } from 'jspdf';
import { numberToWords } from './numberToWords';

export const generateQuotationPDF = (quotation, autoDownload = true) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  const companyName = quotation.companyNameHeader || quotation.companyDetails?.companyName || 'GG TECHCORE';
  const companyTagline = quotation.companyTagline || quotation.companyDetails?.tagline || 'ENGINEERING IDEAS INTO REALITY';
  const companyAddress = quotation.companyAddress || quotation.companyDetails?.address || 'TechCore Engineering Park, Electronics Innovation Hub, Coimbatore, Tamil Nadu - 641014, India';
  const companyPhone = quotation.companyPhone || quotation.companyDetails?.phone || '+91 77089 49507 / +91 63744 31113';
  const companyEmail = quotation.companyEmail || quotation.companyDetails?.email || 'ggbank360@gmail.com';

  // 1. Top Decorative Brand Bar
  doc.setFillColor(2, 132, 199); // #0284c7 Primary Cyan/Blue
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header Section
  y = 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text(companyName, margin, y);

  // Document Type Badge
  doc.setFillColor(224, 242, 254); // #e0f2fe
  doc.roundedRect(pageWidth - margin - 55, y - 6, 55, 9, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text('COMMERCIAL QUOTATION', pageWidth - margin - 27.5, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(companyTagline, margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Hardware Prototyping | Embedded Systems | IoT & Robotics Lab', margin, y);
  doc.text(`Email: ${companyEmail} | Phone: ${companyPhone}`, margin, y + 4);

  const compAddressLines = doc.splitTextToSize(`Address: ${companyAddress}`, contentWidth - 60);
  doc.text(compAddressLines, margin, y + 8);

  y += 8 + (compAddressLines.length * 4);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // 3. Information Grid (Quotation Details & Customer Details)
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 36;

  // Left Box: Quoted To
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text('QUOTED TO (CLIENT DETAILS):', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.customerName || 'N/A', margin + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  if (quotation.companyName) {
    doc.text(quotation.companyName, margin + 4, y + 16.5);
  }
  const clientContact = [quotation.phone, quotation.email].filter(Boolean).join(' | ');
  doc.text(clientContact || 'Contact: N/A', margin + 4, y + 21.5);

  const addressLines = doc.splitTextToSize(quotation.address || 'Address: Tamil Nadu, India', boxWidth - 8);
  doc.text(addressLines, margin + 4, y + 26.5);

  // Right Box: Quotation Meta
  const rightX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text('DOCUMENT SPECIFICATIONS:', rightX + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Quotation No:', rightX + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(quotation.quotationNumber || 'QT-NEW', rightX + 32, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text('Issue Date:', rightX + 4, y + 18);
  doc.text(quotation.date || new Date().toISOString().split('T')[0], rightX + 32, y + 18);

  doc.text('Valid Until:', rightX + 4, y + 24);
  doc.text(quotation.validUntil || '30 Days from date', rightX + 32, y + 24);

  doc.text('Quotation Status:', rightX + 4, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(quotation.status === 'Accepted' ? 22 : (quotation.status === 'Rejected' ? 220 : 2), quotation.status === 'Accepted' ? 163 : 132, quotation.status === 'Accepted' ? 74 : 199);
  doc.text((quotation.status || 'Active').toUpperCase(), rightX + 32, y + 30);

  y += boxHeight + 7;

  // 4. Products & Services Table Header
  const colX = {
    sno: margin,
    desc: margin + 12,
    qty: margin + 117,
    unitPrice: margin + 137,
    total: margin + 160
  };

  const colWidths = {
    sno: 12,
    desc: 105,
    qty: 20,
    unitPrice: 23,
    total: 22
  };

  // Header background
  doc.setFillColor(15, 23, 42); // Navy header
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.sno + 3, y + 5.5);
  doc.text('DESCRIPTION OF PRODUCT / SERVICE', colX.desc + 2, y + 5.5);
  doc.text('QTY', colX.qty + 10, y + 5.5, { align: 'center' });
  doc.text('PRICE (Rs.)', colX.unitPrice + 19, y + 5.5, { align: 'right' });
  doc.text('TOTAL (Rs.)', colX.total + 20, y + 5.5, { align: 'right' });

  y += 8;

  // Table Body Rows
  const items = quotation.items || [];
  let calculatedTotal = 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    const itemQty = Number(item.quantity) || 1;
    const itemPrice = Number(item.unitPrice) || 0;
    const itemTotal = Number(item.total) || (itemQty * itemPrice);
    calculatedTotal += itemTotal;

    const descLines = doc.splitTextToSize(item.description || 'Custom Engineering Service', colWidths.desc - 4);
    const rowHeight = Math.max(7.5, descLines.length * 4.3 + 3);

    // Page break check
    if (y + rowHeight > pageHeight - 50) {
      doc.addPage();
      y = margin;
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('#', colX.sno + 3, y + 5.5);
      doc.text('DESCRIPTION (CONTINUED)', colX.desc + 2, y + 5.5);
      doc.text('QTY', colX.qty + 10, y + 5.5, { align: 'center' });
      doc.text('PRICE (Rs.)', colX.unitPrice + 19, y + 5.5, { align: 'right' });
      doc.text('TOTAL (Rs.)', colX.total + 20, y + 5.5, { align: 'right' });
      y += 8;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(51, 65, 85);
    doc.text(String(index + 1), colX.sno + 4, y + 5.2);
    doc.text(descLines, colX.desc + 2, y + 5.2);
    doc.text(String(itemQty), colX.qty + 10, y + 5.2, { align: 'center' });
    doc.text(itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.unitPrice + 19, y + 5.2, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.total + 20, y + 5.2, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += rowHeight;
  });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);

  y += 4;

  // 5. Total Amount Calculation (No GST or Tax calculations)
  const finalQuotationTotal = Number(quotation.totalAmount) || calculatedTotal;

  const summaryWidth = 75;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(summaryX, y, summaryWidth, 14, 2, 2, 'F');
  doc.setDrawColor(2, 132, 199);
  doc.roundedRect(summaryX, y, summaryWidth, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL QUOTATION:', summaryX + 4, y + 9);

  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text(`Rs. ${finalQuotationTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, y + 9, { align: 'right' });

  // Amount in words
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', margin, y);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(15, 23, 42);
  const words = numberToWords(finalQuotationTotal);
  doc.text(words, margin + 28, y);

  y += 6;

  // 6. Notes & Terms
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text('TERMS & CONDITIONS:', margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const termsText = quotation.notes || 
    '1. Prices quoted are net commercial rates without applicable local taxes.\n' +
    '2. 50% advance along with purchase order; remaining balance upon successful delivery & testing.\n' +
    '3. Hardware components carry 1-year GG TECHCORE laboratory warranty against manufacturing defects.\n' +
    '4. Estimated lead time: 7 to 14 business days from hardware procurement verification.';

  const termLines = doc.splitTextToSize(termsText, contentWidth - 50);
  doc.text(termLines, margin, y);

  // Signatory
  const signatoryName = quotation.signatoryName || quotation.companyDetails?.signatoryName || 'GOWTHAM N K';
  const signatoryTitle = quotation.signatoryTitle || quotation.companyDetails?.signatoryTitle || 'Authorized Engineering Lab Signatory';

  const signX = pageWidth - margin - 52;
  const signY = y + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${companyName}`, signX, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text(signatoryName, signX, signY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(signatoryTitle, signX, signY + 13.5);
  doc.text('(Digitally Verified Document)', signX, signY + 17);

  // Footer bar
  doc.setFillColor(2, 132, 199);
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

  if (autoDownload) {
    const filename = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Quotation_${quotation.quotationNumber || 'QT'}.pdf`;
    doc.save(filename);
  }

  return doc;
};

export const generateBillingPDF = (invoice, autoDownload = true) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  const companyName = invoice.companyNameHeader || invoice.companyDetails?.companyName || 'GG TECHCORE';
  const companyTagline = invoice.companyTagline || invoice.companyDetails?.tagline || 'ENGINEERING IDEAS INTO REALITY';
  const companyAddress = invoice.companyAddress || invoice.companyDetails?.address || 'TechCore Engineering Park, Electronics Innovation Hub, Coimbatore, Tamil Nadu - 641014, India';
  const companyPhone = invoice.companyPhone || invoice.companyDetails?.phone || '+91 77089 49507 / +91 63744 31113';
  const companyEmail = invoice.companyEmail || invoice.companyDetails?.email || 'ggbank360@gmail.com';

  const bankName = invoice.bankName || invoice.companyDetails?.bankName || 'HDFC Bank';
  const accountName = invoice.accountName || invoice.companyDetails?.accountName || 'GG TECHCORE';
  const accountNumber = invoice.accountNumber || invoice.companyDetails?.accountNumber || '50200084920192';
  const ifscCode = invoice.ifscCode || invoice.companyDetails?.ifscCode || 'HDFC0001234';
  const upiId = invoice.upiId || invoice.companyDetails?.upiId || 'ggbank360@okaxis';

  // 1. Top Decorative Brand Bar
  doc.setFillColor(37, 99, 235); // #2563eb Blue accent
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header Section
  y = 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text(companyName, margin, y);

  // Document Type Badge
  doc.setFillColor(238, 242, 255); // #eef2ff
  doc.roundedRect(pageWidth - margin - 50, y - 6, 50, 9, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('FINAL BILL / INVOICE', pageWidth - margin - 25, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text(companyTagline, margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Hardware Prototyping | Embedded Systems | IoT & Robotics Lab', margin, y);
  doc.text(`Email: ${companyEmail} | Phone: ${companyPhone}`, margin, y + 4);

  const compAddressLines = doc.splitTextToSize(`Address: ${companyAddress}`, contentWidth - 60);
  doc.text(compAddressLines, margin, y + 8);

  y += 8 + (compAddressLines.length * 4);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // 3. Information Grid (Bill To & Invoice Meta)
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 36;

  // Left Box: Billed To
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text('BILLED TO (CUSTOMER DETAILS):', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'N/A', margin + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  if (invoice.companyName) {
    doc.text(invoice.companyName, margin + 4, y + 16.5);
  }
  const clientContact = [invoice.phone, invoice.email].filter(Boolean).join(' | ');
  doc.text(clientContact || 'Contact: N/A', margin + 4, y + 21.5);

  const addressLines = doc.splitTextToSize(invoice.address || 'Address: Tamil Nadu, India', boxWidth - 8);
  doc.text(addressLines, margin + 4, y + 26.5);

  // Right Box: Invoice Meta
  const rightX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text('INVOICE SPECIFICATIONS:', rightX + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Invoice No:', rightX + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(invoice.invoiceNumber || 'INV-NEW', rightX + 30, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Date:', rightX + 4, y + 18);
  doc.text(invoice.date || new Date().toISOString().split('T')[0], rightX + 30, y + 18);

  doc.text('Due Date:', rightX + 4, y + 24);
  doc.text(invoice.dueDate || 'Upon Receipt', rightX + 30, y + 24);

  doc.text('Payment Status:', rightX + 4, y + 30);
  const isPaid = (invoice.paymentStatus || '').toLowerCase() === 'paid';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 22 : 217, isPaid ? 163 : 119, isPaid ? 74 : 6);
  doc.text((invoice.paymentStatus || 'Pending').toUpperCase(), rightX + 30, y + 30);

  y += boxHeight + 7;

  // 4. Products & Services Table Header
  const colX = {
    sno: margin,
    desc: margin + 12,
    qty: margin + 117,
    unitPrice: margin + 137,
    total: margin + 160
  };

  const colWidths = {
    sno: 12,
    desc: 105,
    qty: 20,
    unitPrice: 23,
    total: 22
  };

  doc.setFillColor(15, 23, 42); // Dark Navy header
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.sno + 3, y + 5.5);
  doc.text('PRODUCT / SERVICE DETAILS & SPECS', colX.desc + 2, y + 5.5);
  doc.text('QTY', colX.qty + 10, y + 5.5, { align: 'center' });
  doc.text('PRICE (Rs.)', colX.unitPrice + 19, y + 5.5, { align: 'right' });
  doc.text('TOTAL (Rs.)', colX.total + 20, y + 5.5, { align: 'right' });

  y += 8;

  // Table Body Rows
  const items = invoice.items || [];
  let calculatedSubtotal = 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    const itemQty = Number(item.quantity) || 1;
    const itemPrice = Number(item.unitPrice) || 0;
    const itemTotal = Number(item.total) || (itemQty * itemPrice);
    calculatedSubtotal += itemTotal;

    const descLines = doc.splitTextToSize(item.description || 'Engineering Service', colWidths.desc - 4);
    const rowHeight = Math.max(7.5, descLines.length * 4.3 + 3);

    if (y + rowHeight > pageHeight - 65) {
      doc.addPage();
      y = margin;
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('#', colX.sno + 3, y + 5.5);
      doc.text('PRODUCT / SERVICE DETAILS (CONTINUED)', colX.desc + 2, y + 5.5);
      doc.text('QTY', colX.qty + 10, y + 5.5, { align: 'center' });
      doc.text('PRICE (Rs.)', colX.unitPrice + 19, y + 5.5, { align: 'right' });
      doc.text('TOTAL (Rs.)', colX.total + 20, y + 5.5, { align: 'right' });
      y += 8;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(51, 65, 85);
    doc.text(String(index + 1), colX.sno + 4, y + 5.2);
    doc.text(descLines, colX.desc + 2, y + 5.2);
    doc.text(String(itemQty), colX.qty + 10, y + 5.2, { align: 'center' });
    doc.text(itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.unitPrice + 19, y + 5.2, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.total + 20, y + 5.2, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += rowHeight;
  });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);

  y += 4;

  // 5. Automatic Calculations: Subtotal, Discount & Final Amount (NO GST OR TAX)
  const subtotal = Number(invoice.subtotal) || calculatedSubtotal;
  const discount = Number(invoice.discount) || 0;
  const finalAmount = Math.max(0, subtotal - discount);

  const summaryWidth = 80;
  const summaryX = pageWidth - margin - summaryWidth;

  // Subtotal row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX + 4, y + 5);
  doc.text(`Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, y + 5, { align: 'right' });

  // Discount row
  doc.text('Discount:', summaryX + 4, y + 10);
  doc.setTextColor(discount > 0 ? 220 : 71, discount > 0 ? 38 : 85, discount > 0 ? 38 : 105);
  doc.text(`- Rs. ${discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, y + 10, { align: 'right' });

  // Final Amount Box
  y += 14;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(summaryX, y, summaryWidth, 12, 2, 2, 'F');
  doc.setDrawColor(37, 99, 235);
  doc.roundedRect(summaryX, y, summaryWidth, 12, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('FINAL AMOUNT:', summaryX + 4, y + 8);

  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`Rs. ${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, y + 8, { align: 'right' });

  // Amount in words
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', margin, y);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(15, 23, 42);
  const words = numberToWords(finalAmount);
  doc.text(words, margin + 28, y);

  y += 6;

  // Payment Mode & Transaction Reference info & PO Ref
  const payInfoParts = [];
  if (invoice.paymentMode) payInfoParts.push(`Mode: ${invoice.paymentMode}`);
  if (invoice.transactionRef) payInfoParts.push(`Ref / Txn ID: ${invoice.transactionRef}`);
  if (invoice.poNumber) payInfoParts.push(`PO / Ref: ${invoice.poNumber}`);

  if (payInfoParts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Payment Info:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(payInfoParts.join(' | '), margin + 24, y);
    y += 5.5;
  }

  // 6. Notes & Terms & Bank Details
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text('BANK REMITTANCE & PAYMENT DETAILS:', margin, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Bank Name: ${bankName} | Account Name: ${accountName} | A/C No: ${accountNumber} | IFSC: ${ifscCode} | UPI ID: ${upiId}`, margin, y);

  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TERMS & NOTES:', margin, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  const notesText = invoice.notes || 
    '1. Commercial bill without GST/tax calculations. Payment is non-refundable upon component fabrication.\n' +
    '2. For electronic transfers, please share the UTR reference number to ggbank360@gmail.com.';

  const noteLines = doc.splitTextToSize(notesText, contentWidth - 50);
  doc.text(noteLines, margin, y);

  // Signatory
  const signatoryName = invoice.signatoryName || invoice.companyDetails?.signatoryName || 'GOWTHAM N K';
  const signatoryTitle = invoice.signatoryTitle || invoice.companyDetails?.signatoryTitle || 'Authorized Finance Signatory';

  const signX = pageWidth - margin - 52;
  const signY = y + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${companyName}`, signX, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(37, 99, 235);
  doc.text(signatoryName, signX, signY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(signatoryTitle, signX, signY + 13.5);
  doc.text('(Digitally Generated Invoice)', signX, signY + 17);

  // Footer bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

  if (autoDownload) {
    const filename = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Invoice_${invoice.invoiceNumber || 'INV'}.pdf`;
    doc.save(filename);
  }

  return doc;
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- AgriNXT Modern Theme ---
const THEME = {
    primary: [16, 185, 129],      // AgriNXT Emerald Green (Branding)
    secondary: [17, 24, 39],      // Dark Navy (Table Headers / Net Payable)
    textMain: [31, 41, 55],       // Dark Gray
    textSub: [107, 114, 128],     // Light Gray
    bgLight: [249, 250, 251],     // Light Background
    accent: [243, 244, 246]       // Alternating row color
};

/**
 * Shared: Adds a subtle watermark
 */
const addWatermark = (doc) => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.08 })); // Very faint
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(60);
        doc.setFont('helvetica', 'bold');

        // Center text
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text('AgriNXT', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
        doc.restoreGraphicsState();
    }
};

/**
 * Shared: Header Branding
 */
const drawBranding = (doc, title, docNumber) => {
    // Top Green Strip
    doc.setFillColor(...THEME.primary);
    doc.rect(0, 0, 210, 6, 'F');

    // Logo & Brand Name
    doc.setTextColor(...THEME.secondary);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AgriNXT', 15, 28);

    doc.setFontSize(9);
    doc.setTextColor(...THEME.textSub);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Procurement Ecosystem', 15, 33);

    // Title (Right Aligned)
    doc.setFontSize(26);
    doc.setTextColor(...THEME.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 195, 28, { align: 'right' });

    if (docNumber) {
        doc.setFontSize(10);
        doc.setTextColor(...THEME.textSub);
        doc.setFont('helvetica', 'normal');
        doc.text(`# ${docNumber}`, 195, 34, { align: 'right' });
    }

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(15, 42, 195, 42);
};

// ==========================================
// 1. INVOICE GENERATOR
// ==========================================
export const generateInvoicePDF = (invoice, buyerName, farmerName) => {
    const doc = new jsPDF();

    // -- Header --
    drawBranding(doc, 'Invoice', invoice.invoice_number);

    const startY = 55;

    // -- Info Blocks --
    const drawLabelVal = (label, val, x, y) => {
        doc.setFontSize(8);
        doc.setTextColor(...THEME.textSub);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), x, y);

        doc.setFontSize(10);
        doc.setTextColor(...THEME.textMain);
        doc.setFont('helvetica', 'normal');
        doc.text(val, x, y + 5);
    };

    // Date & Status
    drawLabelVal('Invoice Date', new Date(invoice.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }), 15, startY);

    // Status Pill
    doc.setFontSize(8);
    doc.setTextColor(...THEME.textSub);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT STATUS', 168, startY);

    const isPaid = invoice.status === 'PAID';
    doc.setFillColor(...(isPaid ? THEME.primary : [220, 38, 38])); // Green or Red
    doc.roundedRect(168, startY + 2, 24, 7, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(isPaid ? 'PAID' : 'PENDING', 180, startY + 6.5, { align: 'center' });

    // -- Farmer & Buyer Section --
    const yParties = startY + 20;

    // FROM (Farmer)
    doc.setFontSize(9);
    doc.setTextColor(...THEME.secondary); // Navy Blue Header
    doc.setFont('helvetica', 'bold');
    doc.text('FROM (FARMER)', 15, yParties);
    doc.setDrawColor(...THEME.primary); // Green Underline
    doc.setLineWidth(0.5);
    doc.line(15, yParties + 2, 95, yParties + 2);

    doc.setFontSize(11);
    doc.setTextColor(...THEME.textMain);
    doc.text(farmerName, 15, yParties + 9);
    doc.setFontSize(9);
    doc.setTextColor(...THEME.textSub);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Supplier', 15, yParties + 14);

    // BILL TO (Buyer)
    doc.setFontSize(9);
    doc.setTextColor(...THEME.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO (BUYER)', 115, yParties);
    doc.line(115, yParties + 2, 195, yParties + 2);

    doc.setFontSize(11);
    doc.setTextColor(...THEME.textMain);
    doc.text(buyerName, 115, yParties + 9);
    doc.setFontSize(9);
    doc.setTextColor(...THEME.textSub);
    doc.setFont('helvetica', 'normal');
    doc.text('Verified Partner', 115, yParties + 14);

    // -- Table --
    // UPDATED: Using Math.round() to remove decimals
    const tableData = invoice.line_items.map(item => [
        item.vegetable,
        item.chit_code || '-',
        `${Math.round(item.weight)} kg`,
        `Rs ${Math.round(item.price_per_kg)} /kg`,
        `Rs ${Math.round(item.total)}`
    ]);

    autoTable(doc, {
        startY: yParties + 25,
        head: [['ITEM / CROP', 'CHIT REF', 'WEIGHT', 'RATE', 'TOTAL']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: THEME.secondary, // Dark Navy Header
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 5
        },
        styles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: THEME.textMain,
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold', textColor: THEME.secondary },
            1: { cellWidth: 43, halign: 'left' },
            2: { cellWidth: 30, halign: 'left' },
            3: { cellWidth: 35, halign: 'left' },
            4: { cellWidth: 35, halign: 'left', fontStyle: 'bold' }
        },
        alternateRowStyles: {
            fillColor: THEME.bgLight
        }
    });

    // -- Financial Summary (Right Aligned) --
    let finalY = doc.lastAutoTable.finalY + 15;
    const summaryX = 120; // Start X for summary section
    const rightEdge = 195;

    // IMPORTANT: invoice.grand_total is already the NET amount (after 1% commission deduction)
    // So we need to reverse calculate the GROSS amount
    // If net = gross - (gross * 0.01), then net = gross * 0.99, so gross = net / 0.99
    const netPayable = Math.round(invoice.grand_total); // This is the actual net amount (990)
    const grossAmount = Math.round(invoice.grand_total / 0.99); // Reverse calculate gross (1000)
    const commissionAmount = grossAmount - netPayable; // Commission is the difference (10)

    // Gross Amount
    doc.setFontSize(10);
    doc.setTextColor(...THEME.textMain);
    doc.text('Gross Amount', summaryX, finalY);
    doc.text(`RS ${grossAmount}`, rightEdge, finalY, { align: 'right' });

    // Commission
    finalY += 7;
    doc.setTextColor(...[220, 38, 38]); // Red text for deductions
    doc.text('Platform Commission (1%)', summaryX, finalY);
    doc.text(`- RS: ${commissionAmount}`, rightEdge, finalY, { align: 'right' });

    // Net Payable Box
    finalY += 15;
    doc.setFillColor(...THEME.secondary); // Dark Navy Box
    doc.roundedRect(summaryX - 5, finalY - 5, (rightEdge - summaryX) + 10, 14, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Payable', summaryX, finalY + 3);
    doc.text(`RS ${netPayable}`, rightEdge, finalY + 3, { align: 'right' });

    // Footer & Watermark
    addWatermark(doc);

    // Simple footer text
    doc.setFontSize(8);
    doc.setTextColor(...THEME.textSub);
    doc.text('Thank you for doing business with us.', 15, 285);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 195, 285, { align: 'right' });

    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
};

// ==========================================
// 2. COLLECTION CHIT GENERATOR
// ==========================================
export const generateCollectionChitPDF = (chit, buyerName, farmerName, items) => {
    const doc = new jsPDF();

    drawBranding(doc, 'Collection Chit', chit.chit_code);

    // -- Info Box --
    doc.setFillColor(...THEME.bgLight);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(15, 50, 180, 40, 2, 2, 'FD');

    const boxY = 62;
    // Date
    doc.setFontSize(9);
    doc.setTextColor(...THEME.textSub);
    doc.text('COLLECTION DATE', 25, boxY);
    doc.setFontSize(12);
    doc.setTextColor(...THEME.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(chit.collection_date).toLocaleDateString('en-IN', { dateStyle: 'medium' }), 25, boxY + 7);

    // Weight
    // UPDATED: Rounding total weight
    doc.text('TOTAL WEIGHT', 100, boxY);
    doc.setFontSize(14);
    doc.setTextColor(...THEME.primary);
    doc.text(`${Math.round(chit.total_weight)} kg`, 100, boxY + 8);

    // Location
    // NOTE: Coordinates kept as decimals for map accuracy
    if (chit.location_lat) {
        doc.setFontSize(9);
        doc.setTextColor(...THEME.textSub);
        doc.setFont('helvetica', 'normal');
        doc.text(`Location: ${chit.location_lat.toFixed(4)}, ${chit.location_lng.toFixed(4)}`, 185, boxY + 5, { align: 'right' });
    }

    // -- Participants --
    const partY = 105;

    doc.setFontSize(10);
    doc.setTextColor(...THEME.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPPLIER (FARMER)', 15, partY);
    doc.text('RECEIVER (BUYER)', 115, partY);

    doc.setDrawColor(...THEME.primary);
    doc.line(15, partY + 2, 95, partY + 2);
    doc.line(115, partY + 2, 195, partY + 2);

    doc.setFontSize(11);
    doc.setTextColor(...THEME.textMain);
    doc.setFont('helvetica', 'normal');
    doc.text(farmerName, 15, partY + 10);
    doc.text(buyerName, 115, partY + 10);

    // -- Table --
    // UPDATED: Rounding item weights
    const tableData = items.map(item => [
        item.vegetable_name,
        `${Math.round(item.weight)} kg`,
        'Confirmed'
    ]);

    autoTable(doc, {
        startY: partY + 25,
        head: [['CROP / COMMODITY', 'VERIFIED WEIGHT', 'STATUS']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255], // White header
            textColor: THEME.secondary, // Navy Text
            lineWidth: { bottom: 0.5 },
            lineColor: THEME.secondary,
            fontStyle: 'bold'
        },
        styles: {
            cellPadding: 8,
            fontSize: 10,
            textColor: THEME.textMain
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right' },
            2: { halign: 'center', textColor: THEME.primary }
        }
    });

    // -- Signatures --
    const signY = 250;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, signY, 80, signY);
    doc.line(115, signY, 180, signY);

    doc.setFontSize(8);
    doc.setTextColor(...THEME.textSub);
    doc.text('Authorized Signature (Farmer)', 15, signY + 5);
    doc.text('Authorized Signature (Buyer)', 115, signY + 5);

    addWatermark(doc);
    doc.save(`Chit_${chit.chit_code}.pdf`);
};
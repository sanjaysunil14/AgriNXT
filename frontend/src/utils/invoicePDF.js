import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoice, buyerName, farmerName) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Procurement Management System', 105, 28, { align: 'center' });
    doc.text('Farmer-to-Buyer Platform', 105, 33, { align: 'center' });

    // Invoice Details Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 45, 182, 30, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(60);

    // Left column
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 52);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}`, 20, 59);
    doc.text(`Status: ${invoice.status}`, 20, 66);

    // Right column
    doc.text(`Buyer: ${buyerName}`, 120, 52);
    doc.text(`Farmer: ${farmerName}`, 120, 59);

    // Line Items Table
    const tableData = invoice.line_items.map(item => [
        item.vegetable,
        `${item.weight.toFixed(2)} kg`,
        `₹${item.price_per_kg.toFixed(2)}`,
        `₹${item.total.toFixed(2)}`,
        item.chit_code || '-'
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Vegetable', 'Weight', 'Price/kg', 'Amount', 'Chit Code']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [79, 70, 229], // primary-600
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 45 }
        }
    });

    // Grand Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.setFillColor(245, 245, 245);
    doc.rect(120, finalY, 76, 12, 'FD');
    doc.text('Grand Total:', 125, finalY + 8);
    doc.setFont(undefined, 'bold');
    doc.text(`₹${invoice.grand_total.toFixed(2)}`, 190, finalY + 8, { align: 'right' });

    // Payment Status
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const statusY = finalY + 25;

    if (invoice.status === 'PAID') {
        doc.setTextColor(0, 128, 0);
        doc.text('✓ PAID', 14, statusY);
    } else {
        doc.setTextColor(200, 0, 0);
        doc.text('⚠ PENDING PAYMENT', 14, statusY);
    }

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(8);
    const footerY = 280;
    doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 105, footerY + 5, { align: 'center' });

    // Save PDF
    const fileName = `Invoice_${invoice.invoice_number}_${farmerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};

export const generateCollectionChitPDF = (chit, buyerName, farmerName, items) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('COLLECTION CHIT', 105, 20, { align: 'center' });

    // Chit Details Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 35, 182, 35, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(60);

    // Details
    doc.text(`Chit Code: ${chit.chit_code}`, 20, 43);
    doc.text(`Buyer: ${buyerName}`, 20, 50);
    doc.text(`Farmer: ${farmerName}`, 20, 57);
    doc.text(`Date: ${new Date(chit.collection_date).toLocaleDateString('en-IN')}`, 120, 43);
    doc.text(`Total Weight: ${chit.total_weight.toFixed(2)} kg`, 120, 50);
    doc.text(`Location: ${chit.location_lat?.toFixed(4)}, ${chit.location_lng?.toFixed(4)}`, 120, 57);

    // Items Table
    const tableData = items.map(item => [
        item.vegetable_name,
        `${item.weight.toFixed(2)} kg`
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['Vegetable', 'Weight']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 11,
            cellPadding: 6
        },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 60, halign: 'right' }
        }
    });

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text('Digital Collection Chit - Procurement Management System', 105, 280, { align: 'center' });

    // Save PDF
    const fileName = `Chit_${chit.chit_code}_${farmerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};

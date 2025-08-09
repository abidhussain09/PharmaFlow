const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generateReceiptPDF = (sale, customer, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('Sales Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date(sale.saleDate).toLocaleString()}`);
  doc.text(`Customer: ${customer.name}`);
  doc.text(`Email: ${customer.email}`);
  doc.text(`Phone: ${customer.phone}`);
  doc.moveDown();

  doc.text('Products:');
  sale.products.forEach(p => {
    doc.text(`- ${p.product.name} | Qty: ${p.quantity} | Price: ₹${p.price}`);
  });

  doc.moveDown();
  doc.text(`Total Amount: ₹${sale.totalAmount}`, { align: 'right' });

  doc.end();
};

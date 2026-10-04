import React from 'react';

const InvoiceModal = ({ order, onClose }) => {
  const generateInvoiceHTML = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1>INVOICE</h1>
          <p>Order #${order._id}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3>From:</h3>
            <p>ShopEase<br/>123 Commerce Street<br/>Digital City, DC 12345</p>
          </div>
          <div>
            <h3>Bill To:</h3>
            <p>${order.customerName}<br/>${order.customerAddress}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Unit Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 10px;">${item.name}</td>
                <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right;"><strong>$${order.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin-top: 50px;">
          <p>Thank you for shopping with ShopEase!</p>
          <p>Payment Status: ${order.paymentStatus || 'Pending'}</p>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateInvoiceHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateInvoiceHTML()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `invoice_${order._id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal invoice-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Order Invoice</h2>
        <div className="invoice-actions">
          <button onClick={handlePrint} className="btn">🖨️ Print Invoice</button>
          <button onClick={handleDownload} className="btn-secondary">📥 Download PDF</button>
        </div>
        <div className="invoice-preview" dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }} />
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InvoiceModal;
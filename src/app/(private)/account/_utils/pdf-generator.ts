import jsPDF from 'jspdf';

interface InvoiceData {
  subscriptionId: string;
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
  purchaseDate: string;
  paymentId: string;
  duration: number;
  customerName: string;
  customerEmail: string;
  paymentGateway: string;
}

// Function to convert SVG to PNG data URL
const convertSvgToPng = (svgString: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  });
};

export const generatePDFInvoice = async (data: InvoiceData): Promise<void> => {
  try {
    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Load and add logo
    try {
      const logoResponse = await fetch('/favicon.svg');
      const logoSvg = await logoResponse.text();
      
      // Convert SVG to PNG
      const logoPng = await convertSvgToPng(logoSvg, 100, 100);
      
      // Add logo as PNG
      pdf.addImage(logoPng, 'PNG', 20, 20, 25, 25);
    } catch (error) {
      console.warn('Could not load logo:', error);
      // Draw a simple placeholder rectangle for logo
      pdf.setFillColor(229, 231, 235);
      pdf.rect(20, 20, 25, 25, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('LOGO', 32.5, 35, { align: 'center' });
    }

    // Company Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55); // slate-800
    pdf.text('TrackyFy', 55, 35);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // slate-500
    pdf.text('Gym Management Solution', 55, 42);

    // Invoice Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('SUBSCRIPTION INVOICE', 20, 70);

    // Invoice Details Section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81); // slate-700
    pdf.text('Invoice Details:', 20, 90);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Invoice #: INV-${data.subscriptionId}`, 20, 98);
    pdf.text(`Issue Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 106);
    pdf.text(`Payment ID: ${data.paymentId}`, 20, 114);
    pdf.text(`Payment Gateway: ${data.paymentGateway.toUpperCase()}`, 20, 122);

    // Customer Information
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81);
    pdf.text('Customer Information:', 110, 90);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Name: ${data.customerName}`, 110, 98);
    pdf.text(`Email: ${data.customerEmail}`, 110, 106);
    pdf.text(`Subscription ID: ${data.subscriptionId}`, 110, 114);

    // Subscription Details Table
    const tableStartY = 140;
    
    // Table Header
    pdf.setFillColor(249, 250, 251); // slate-50
    pdf.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81);
    pdf.text('Description', 25, tableStartY + 8);
    pdf.text('Period', 80, tableStartY + 8);
    pdf.text('Duration', 130, tableStartY + 8);
    pdf.text('Amount', 160, tableStartY + 8);

    // Table Content
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    const contentY = tableStartY + 20;
    pdf.text(`${data.planName} Subscription`, 25, contentY);
    pdf.text(`${data.startDate} - ${data.endDate}`, 80, contentY);
    pdf.text(`${data.duration} days`, 130, contentY);
    // Fix currency display - use INR instead of rupee symbol
    pdf.text(`INR ${data.amount}`, 160, contentY);

    // Table border
    pdf.setDrawColor(229, 231, 235); // slate-200
    pdf.rect(20, tableStartY, pageWidth - 40, 32);
    pdf.line(20, tableStartY + 12, pageWidth - 20, tableStartY + 12);

    // Total Amount Section
    const totalY = contentY + 30;
    pdf.setFillColor(240, 249, 255); // blue-50
    pdf.rect(20, totalY, pageWidth - 40, 25, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Total Amount Paid', pageWidth / 2, totalY + 10, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    // Fix currency display - use INR instead of rupee symbol
    pdf.text(`INR ${data.amount}`, pageWidth / 2, totalY + 20, { align: 'center' });

    // Payment Status
    const statusY = totalY + 40;
    pdf.setFillColor(240, 253, 244); // green-50
    pdf.rect(20, statusY, pageWidth - 40, 15, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(22, 163, 74); // green-600
    // Use checkmark symbol that's supported
    pdf.text('✓ PAYMENT COMPLETED', pageWidth / 2, statusY + 10, { align: 'center' });

    // Footer
    const footerY = pageHeight - 40;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Thank you for choosing TrackyFy!', pageWidth / 2, footerY, { align: 'center' });
    pdf.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY + 8, { align: 'center' });
    pdf.text('For support, contact us at support@trackyfy.com', pageWidth / 2, footerY + 16, { align: 'center' });

    // Add border to the entire invoice
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Save the PDF
    pdf.save(`TrackyFy-Invoice-${data.subscriptionId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF invoice');
  }
};

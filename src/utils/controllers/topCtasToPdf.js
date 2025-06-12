import { notification } from 'antd';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const topCtasToPdf = data => {
  const formattedData = data;

  const doc = new jsPDF();

  try {
    const tableColumn = ['Title', 'Action Type', 'Total Takes']; // Directly use the keys
    const tableRows = [];

    formattedData.forEach(item => {
      const row = [item.Title, item['Action Type'], item['Total Takes']]; // Access values using direct keys
      tableRows.push(row);
    });

    // Add title to the document
    doc.setFontSize(16);
    doc.text('Top CTAs', 10, 20);

    // Start the table after the logo and title
    const startY = 30; // Adjust the start position of the table based on logo height

    doc.autoTable({
      startY: startY, // Adjust the start position of the table
      head: [tableColumn],
      body: tableRows,
      margin: { left: 10 }, // Align the table to the left
      headStyles: {
        fillColor: [0, 51, 102], // RGB color for the header background
        textColor: [255, 255, 255], // RGB color for the header text
        fontStyle: 'bold', // Font style for the header text
      },
    });

    const pdfTitle = `Bridged Media - Top CTAs.pdf`;

    doc.save(pdfTitle);
  } catch (error) {
    notification.error({
      message: 'An error occurred while generating the PDF. Please try again.',
      placement: 'bottomRight',
      showProgress: true,
    });
  }
};

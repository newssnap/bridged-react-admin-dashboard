import { notification } from 'antd';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const topEngagementToPdf = data => {
  const formattedData = data;

  const doc = new jsPDF();

  try {
    const tableColumn = ['Title', 'Engagement Type', 'Option Title', 'Takes Count'];
    const tableRows = [];

    formattedData.forEach(item => {
      const row = [item.Title, item['Engagement Type'], item['Option Title'], item['Takes Count']];
      tableRows.push(row);
    });

    // Add title to the document
    doc.setFontSize(16);
    doc.text('Top Engagement', 10, 20);

    // Add some margin after the title
    const startY = 30; // Adjust the start position of the table based on title position

    // Generate the table
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

    const pdfTitle = `Bridged Media - Top Engagement.pdf`;

    doc.save(pdfTitle);
  } catch (error) {
    console.error('An error occurred while generating the PDF:', error);
    notification.error({
      message: 'An error occurred while generating the PDF',
      placement: 'bottomRight',
      showProgress: true,
    });
  }
};

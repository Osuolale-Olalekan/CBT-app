// // lib/utils/pdf.ts
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// export interface PDFResultData {
//   studentName: string;
//   studentEmail: string;
//   department: string;
//   examTitle: string;
//   score: number;
//   totalQuestions: number;
//   percentage: number;
//   timeSpent: number;
//   submittedAt: Date;
//   passed: boolean;
//   answers: {
//     question: string;
//     options: string[];
//     selectedOption: number;
//     correctOption: number;
//     isCorrect: boolean;
//     subject: string;
//   }[];
// }

// export function generateResultPDF(data: PDFResultData): jsPDF {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 20;
//   let currentY = 30;

//   // Header
//   doc.setFontSize(20);
//   doc.setTextColor(0, 102, 204);
//   doc.text('CBT EXAM RESULT', pageWidth / 2, currentY, { align: 'center' });
//   currentY += 20;

//   // Student Information
//   doc.setFontSize(14);
//   doc.setTextColor(0, 0, 0);
//   doc.text('STUDENT INFORMATION', margin, currentY);
//   currentY += 10;

//   doc.setFontSize(11);
//   doc.text(`Name: ${data.studentName}`, margin, currentY);
//   currentY += 8;
//   doc.text(`Email: ${data.studentEmail}`, margin, currentY);
//   currentY += 8;
//   doc.text(`Department: ${data.department}`, margin, currentY);
//   currentY += 8;
//   doc.text(`Date: ${data.submittedAt.toLocaleDateString()}`, margin, currentY);
//   currentY += 15;

//   // Exam Information
//   doc.setFontSize(14);
//   doc.text('EXAM INFORMATION', margin, currentY);
//   currentY += 10;

//   doc.setFontSize(11);
//   doc.text(`Exam Title: ${data.examTitle}`, margin, currentY);
//   currentY += 8;
//   doc.text(`Time Spent: ${Math.floor(data.timeSpent / 60)} minutes ${data.timeSpent % 60} seconds`, margin, currentY);
//   currentY += 15;

//   // Results Summary
//   doc.setFontSize(14);
//   doc.text('RESULTS SUMMARY', margin, currentY);
//   currentY += 10;

//   doc.setFontSize(12);
//   doc.text(`Score: ${data.score}/${data.totalQuestions}`, margin, currentY);
//   currentY += 8;
//   doc.text(`Percentage: ${data.percentage}%`, margin, currentY);
//   currentY += 8;

//   // Pass/Fail status
//   const [r, g, b] = data.passed ? [0, 128, 0] : [255, 0, 0];
// doc.setTextColor(r, g, b);
// doc.text(`Status: ${data.passed ? 'PASSED' : 'FAILED'}`, margin, currentY);
// doc.setTextColor(0, 0, 0); // reset to black
// currentY += 20;

//   // doc.setTextColor(data.passed ? 0, 128, 0 : 255, 0, 0);
//   // doc.text(`Status: ${data.passed ? 'PASSED' : 'FAILED'}`, margin, currentY);
//   // doc.setTextColor(0, 0, 0);
//   // currentY += 20;

//   // Question-wise breakdown
//   doc.setFontSize(14);
//   doc.text('QUESTION BREAKDOWN', margin, currentY);
//   currentY += 15;

//   data.answers.forEach((answer, index) => {
//     // Check if we need a new page
//     if (currentY > 250) {
//       doc.addPage();
//       currentY = 30;
//     }

//     doc.setFontSize(10);
//     doc.text(`Q${index + 1}: ${answer.question}`, margin, currentY, { maxWidth: pageWidth - 2 * margin });
//     currentY += 12;

//     // Options
//     answer.options.forEach((option, optIndex) => {
//       let prefix = `${String.fromCharCode(65 + optIndex)}. `;
//       let color = [0, 0, 0]; // Default black

//       if (optIndex === answer.correctOption) {
//         prefix += '✓ '; // Correct answer
//         color = [0, 128, 0]; // Green
//       } else if (optIndex === answer.selectedOption && !answer.isCorrect) {
//         prefix += '✗ '; // Wrong selected answer
//         color = [255, 0, 0]; // Red
//       }

//       doc.setTextColor(color[0], color[1], color[2]);
//       doc.text(prefix + option, margin + 10, currentY);
//       doc.setTextColor(0, 0, 0);
//       currentY += 6;
//     });

//     currentY += 8;
//   });

//   // Footer
//   const pageCount = doc.getNumberOfPages();
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);
//     doc.setFontSize(8);
//     doc.setTextColor(128, 128, 128);
//     doc.text(
//       `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
//       pageWidth / 2,
//       doc.internal.pageSize.getHeight() - 10,
//       { align: 'center' }
//     );
//   }

//   return doc;
// }

// export function downloadResultPDF(data: PDFResultData): void {
//   const pdf = generateResultPDF(data);
//   const filename = `${data.studentName.replace(/\s+/g, '_')}_${data.examTitle.replace(/\s+/g, '_')}_Result.pdf`;
//   pdf.save(filename);
// }


import jsPDF from 'jspdf';
import QRCode from 'qrcode'; // npm install qrcode

export interface PDFResultData {
  studentName: string;
  studentEmail: string;
  department: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  submittedAt: Date;
  passed: boolean;
  answers: {
    question: string;
    options: string[];
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    subject: string;
  }[];
  verificationUrl?: string; // Optional link for verification
}

export async function generateResultPDF(data: PDFResultData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 40;

  // ===== SUBJECT BREAKDOWN CALCULATION =====
const subjectBreakdown: Record<string, { correct: number; total: number }> = {};

for (const ans of data.answers) {
  if (!subjectBreakdown[ans.subject]) {
    subjectBreakdown[ans.subject] = { correct: 0, total: 0 };
  }
  subjectBreakdown[ans.subject].total += 1;
  if (ans.isCorrect) subjectBreakdown[ans.subject].correct += 1;
}


// ===== TOTAL SCORE CALCULATION =====
const totalCorrect = Object.values(subjectBreakdown).reduce((sum, s) => sum + s.correct, 0);
const totalQuestions = Object.values(subjectBreakdown).reduce((sum, s) => sum + s.total, 0);
const totalPercentage = ((totalCorrect / totalQuestions) * 100).toFixed(1);



  // ===== HEADER BANNER =====
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(`GOD'S WAY CBT EXAM RESULT`, pageWidth / 2, 16, { align: 'center' });

  // ===== OPTIONAL SMALL LOGO IN HEADER =====
  const logoUrl = '/school_logo.png';
  doc.addImage(logoUrl, 'PNG', margin, 4, 18, 18);

  // ✅ Reset font & color so only header stays bold
doc.setFont("helvetica", "normal");
doc.setTextColor(0, 0, 0);
doc.setFontSize(11);

  
// ===== 🖼️ FAINT CENTER LOGO =====
try {
  const watermarkImg = '/school_logo.png';
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  const logoWidth = 100;
  const logoHeight = 100;

  // Create opacity state safely
  const GStateClass = (doc as unknown as { GState: new (params: { opacity: number }) => unknown }).GState;
  const setGStateFn = (doc as unknown as { setGState: (state: unknown) => void }).setGState;

  const fadedState = new GStateClass({ opacity: 0.2 });
  setGStateFn.call(doc, fadedState);

  doc.addImage(
    watermarkImg,
    'PNG',
    centerX - logoWidth / 2,
    centerY - logoHeight / 2,
    logoWidth,
    logoHeight
  );

  const normalState = new GStateClass({ opacity: 1 });
  setGStateFn.call(doc, normalState);
} catch (err) {
  console.warn('⚠️ Watermark logo failed:', err);
}



  // ===== SECTION HEADER HELPER =====
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(230, 240, 255);
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(13);
    doc.text(title, margin + 2, currentY + 2);
    doc.setTextColor(0, 0, 0);
    currentY += 14;
  };

  // ===== STUDENT INFORMATION =====
  drawSectionHeader('STUDENT INFORMATION');
  const labelX = margin;
  const valueX = margin + 45;

  doc.setFontSize(11);
  doc.text('Name:', labelX, currentY);
  doc.text(data.studentName, valueX, currentY);
  currentY += 8;

  doc.text('Email:', labelX, currentY);
  doc.text(data.studentEmail, valueX, currentY);
  currentY += 8;

  doc.text('Department:', labelX, currentY);
  doc.text(data.department, valueX, currentY);
  currentY += 8;

  doc.text('Date:', labelX, currentY);
  doc.text(data.submittedAt.toLocaleDateString(), valueX, currentY);
  currentY += 15;

  // ===== EXAM INFORMATION =====
  drawSectionHeader('EXAM INFORMATION');
  doc.text('Exam Title:', labelX, currentY);
  doc.text(data.examTitle, valueX, currentY);
  currentY += 8;

  doc.text('Time Spent:', labelX, currentY);
  doc.text(
    `${Math.floor(data.timeSpent / 60)} mins ${data.timeSpent % 60} secs`,
    valueX,
    currentY
  );
  currentY += 15;


    // ===== TEXT WATERMARK (OPTIONAL) =====
doc.setTextColor(240);
doc.setFontSize(75);

// Adjust this small offset if it still looks off by a few pixels
const xOffset = 30; // move right (+) or left (-)
const yOffset = 60; // keeps it slightly lower

doc.text('CONFIDENTIAL', pageWidth / 2 + xOffset, pageHeight / 2 + yOffset, {
  align: 'center',
  angle: 45,
});

doc.setTextColor(0);



// ===== SUBJECTS BREAKDOWN =====
drawSectionHeader('SUBJECTS BREAKDOWN');

doc.setFontSize(11);
doc.setFont("helvetica", "bold");
doc.text('Subject', margin, currentY);
doc.text('Score', pageWidth - margin - 30, currentY);
doc.setFont("helvetica", "normal");
currentY += 8;

// Draw each subject row
Object.entries(subjectBreakdown).forEach(([subject, stats]) => {
  const scoreText = `${stats.correct}/${stats.total}`;
  doc.text(subject, margin, currentY);
  doc.text(scoreText, pageWidth - margin - 30, currentY);
  currentY += 7;

  // If we're near the bottom, add a new page
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 40;
  }
});

// ===== TOTAL SCORE SUMMARY =====
doc.setFillColor(200, 200, 200);
doc.rect(margin - 2, currentY - 6, pageWidth - margin * 2, 10, 'F');

doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0);
doc.text('TOTAL SCORE', margin, currentY);
doc.setFont("helvetica", "normal");


const totalText = `${totalCorrect} / ${totalQuestions}  (${totalPercentage}%)`;
doc.text(totalText, pageWidth - margin - 30, currentY);
currentY += 15;
// doc.text(totalText, pageWidth - margin - 30, currentY);

// currentY += 10;


// currentY += 10;




  // ===== RESULT SUMMARY =====
  drawSectionHeader('RESULT SUMMARY');
  currentY -= 5;
  const boxColor = data.passed ? [220, 255, 220] : [255, 230, 230];
  doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 25, 'F');


  const textColor = data.passed ? [0, 128, 0] : [255, 0, 0];
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(13);
  doc.text(`Status: ${data.passed ? 'PASSED ✅' : 'FAILED ❌'}`, margin + 5, currentY + 7);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Score: ${data.score}/${data.totalQuestions}`, margin + 80, currentY + 7);
  doc.text(`Percentage: ${data.percentage}%`, margin + 80, currentY + 14);
  currentY += 35;

  // ===== QR CODE =====
  try {
    const qrData =
      data.verificationUrl ||
      `School: GOD'S WAY \nStudent: ${data.studentName}\nExam: ${data.examTitle}\nScore: ${data.score}/${data.totalQuestions}\nGrade: ${data.percentage}%` ;
    const qrImage = await QRCode.toDataURL(qrData, { width: 120 });
    const qrX = pageWidth - margin - 35;
    const qrY = pageHeight - 55;
    doc.addImage(qrImage, 'PNG', qrX, qrY, 30, 30);
    doc.setFontSize(9);
    doc.text('Scan to Verify', qrX + 5, qrY + 35);
  } catch (err) {
    console.warn('⚠️ QR generation failed:', err);
  }

  // ===== FOOTER SIGNATURE =====
  const footerY = pageHeight - 30;
  doc.setFontSize(11);
  doc.text('_________________________', margin, footerY);
  doc.text('Exam Officer Signature', margin, footerY + 5);

  // ===== PAGE FOOTER INFO =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  

  return doc;
}

// ===== DOWNLOAD PDF =====
export async function downloadResultPDF(data: PDFResultData): Promise<void> {
  const pdf = await generateResultPDF(data);
  const filename = `${data.studentName.replace(/\s+/g, '_')}_${data.examTitle.replace(
    /\s+/g,
    '_'
  )}_Result.pdf`;
  pdf.save(filename);
}

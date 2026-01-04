
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getMimeTypeForFormat = (format: string): string => {
  switch (format) {
    case 'markdown': return 'text/markdown';
    case 'json': return 'application/json';
    case 'csv': return 'text/csv';
    case 'html': return 'text/html';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'rtf': return 'application/rtf';
    case 'pdf': return 'text/html'; // We serve HTML for PDF preview/print
    default: return 'text/plain';
  }
};

export const getExtensionForFormat = (format: string): string => {
  switch (format) {
    case 'markdown': return 'md';
    case 'json': return 'json';
    case 'csv': return 'csv';
    case 'html': return 'html';
    case 'docx': return 'docx';
    case 'rtf': return 'rtf';
    case 'pdf': return 'html'; // User will print HTML to PDF
    default: return 'txt';
  }
};

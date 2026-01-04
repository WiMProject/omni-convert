
export enum FileFormat {
  MARKDOWN = 'markdown',
  JSON = 'json',
  CSV = 'csv',
  TEXT = 'text',
  HTML = 'html',
  DOCX = 'docx',
  RTF = 'rtf',
  PDF = 'pdf'
}

export interface ConversionRequest {
  file: File;
  targetFormat: FileFormat;
  options?: {
    summarize?: boolean;
    translateTo?: string;
  };
}

export interface ConversionResult {
  content: string;
  format: FileFormat;
  fileName: string;
}

export enum ConversionStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

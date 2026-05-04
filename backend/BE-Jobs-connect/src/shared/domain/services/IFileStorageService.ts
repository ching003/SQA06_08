export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IFileStorageService {
  uploadFile(file: UploadedFile, folder: string, filename?: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
  validateImageFile(file: UploadedFile, maxSizeMB?: number): FileValidationResult;
  validateDocumentFile(file: UploadedFile, maxSizeMB?: number): FileValidationResult;
  validateHtmlFile(file: UploadedFile, maxSizeMB?: number): FileValidationResult;
  getFileUrl(path: string): Promise<string>;
}

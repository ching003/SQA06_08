import { v4 as uuidv4 } from 'uuid';
import type { IFileStorageService, UploadedFile, FileValidationResult } from '../../domain/services/IFileStorageService.js';
import { bucket } from '../config/firebase.config.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_HTML_TYPES = ['text/html'];
const DEFAULT_MAX_IMAGE_SIZE_MB = 5;
const DEFAULT_MAX_DOCUMENT_SIZE_MB = 10;
const DEFAULT_MAX_HTML_SIZE_MB = 5;

export class FirebaseStorageService implements IFileStorageService {
  async uploadFile(
    file: UploadedFile,
    folder: string,
    filename?: string
  ): Promise<string> {
    const finalFilename = filename || `${uuidv4()}-${file.originalname}`;
    const filePath = `${folder}/${finalFilename}`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return publicUrl;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const bucketName = bucket.name;
      const urlPattern = new RegExp(`https://storage.googleapis.com/${bucketName}/(.+)`);
      const match = url.match(urlPattern);

      if (match && match[1]) {
        const filePath = decodeURIComponent(match[1]);
        const fileRef = bucket.file(filePath);
        const [exists] = await fileRef.exists();

        if (exists) {
          await fileRef.delete();
        }
      }
    } catch (error) {
      console.error('Error deleting file from Firebase:', error);
      // Don't throw error if file doesn't exist
    }
  }

  validateImageFile(file: UploadedFile, maxSizeMB: number = DEFAULT_MAX_IMAGE_SIZE_MB): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { isValid: true };
  }

  validateDocumentFile(file: UploadedFile, maxSizeMB: number = DEFAULT_MAX_DOCUMENT_SIZE_MB): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`,
      };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { isValid: true };
  }

  validateHtmlFile(file: UploadedFile, maxSizeMB: number = DEFAULT_MAX_HTML_SIZE_MB): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Check if it's an HTML file by mimetype or extension
    const isHtml =
      ALLOWED_HTML_TYPES.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith('.html') ||
      file.originalname.toLowerCase().endsWith('.htm');

    if (!isHtml) {
      return {
        isValid: false,
        error: 'Invalid file type. Only HTML files are allowed',
      };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { isValid: true };
  }

  async getFileUrl(path: string): Promise<string> {
    const fileRef = bucket.file(path);
    const [exists] = await fileRef.exists();

    if (!exists) {
      throw new Error(`File not found: ${path}`);
    }

    return `https://storage.googleapis.com/${bucket.name}/${path}`;
  }
}

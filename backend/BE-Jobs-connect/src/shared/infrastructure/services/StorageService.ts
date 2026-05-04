import { v4 as uuidv4 } from 'uuid';
import type { IStorageService } from '../../domain/services/IStorageService.js';
import { bucket } from '../config/firebase.config.js';
import { ValidationError } from '../../domain/errors/index.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_DOCUMENT_SIZE_MB = 10;

export class StorageService implements IStorageService {
  async uploadImage(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    folder: string
  ): Promise<string> {
    // Validate image
    if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      throw new ValidationError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận các định dạng: JPEG, PNG, GIF, WEBP');
    }

    const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      throw new ValidationError(`Kích thước ảnh vượt quá giới hạn ${MAX_IMAGE_SIZE_MB}MB`);
    }

    // Generate unique filename
    const filename = `${uuidv4()}-${originalname}`;
    const filePath = `${folder}/${filename}`;
    const fileRef = bucket.file(filePath);

    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  }

  async uploadDocument(
    buffer: Buffer,
    originalname: string,
    mimetype: string
  ): Promise<string> {
    // Validate document
    if (!ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
      throw new ValidationError('Định dạng tài liệu không hợp lệ. Chỉ chấp nhận các định dạng: PDF, DOC, DOCX, JPG, PNG');
    }

    const maxSizeBytes = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      throw new ValidationError(`Kích thước tài liệu vượt quá giới hạn ${MAX_DOCUMENT_SIZE_MB}MB`);
    }

    // Generate unique filename
    const filename = `${uuidv4()}-${originalname}`;
    const filePath = `company-documents/${filename}`;
    const fileRef = bucket.file(filePath);

    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
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
      // Don't throw error - file deletion failure should not block operations
    }
  }
}

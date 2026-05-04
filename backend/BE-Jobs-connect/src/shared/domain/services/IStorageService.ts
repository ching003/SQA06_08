export interface IStorageService {
  uploadImage(buffer: Buffer, originalname: string, mimetype: string, folder: string): Promise<string>;
  uploadDocument(buffer: Buffer, originalname: string, mimetype: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}

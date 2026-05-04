import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

// Multer configuration with memory storage
const storage = multer.memoryStorage();

// File filter for image files only
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// File filter for HTML files
const htmlFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isHtml =
    file.mimetype === 'text/html' ||
    file.originalname.toLowerCase().endsWith('.html') ||
    file.originalname.toLowerCase().endsWith('.htm');
  if (isHtml) {
    cb(null, true);
  } else {
    cb(new Error('Only HTML files are allowed'));
  }
};

// File filter for documents (PDF, images)
const documentFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed'));
  }
};

// Create multer instance for single image upload
const singleImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware wrapper for single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = singleImageUpload.single(fieldName);

    upload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds 5MB limit',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : 'File upload error',
        });
      }
      next();
    });
  };
};

// Middleware for CV template file upload (template HTML and preview image)
export const uploadTemplateFiles = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      // Template file must be HTML
      if (file.fieldname === 'template') {
        const isHtml =
          file.mimetype === 'text/html' ||
          file.originalname.toLowerCase().endsWith('.html') ||
          file.originalname.toLowerCase().endsWith('.htm');
        if (isHtml) {
          cb(null, true);
        } else {
          cb(new Error('Template file must be an HTML file'));
        }
      }
      // Preview file must be image
      else if (file.fieldname === 'preview') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Preview file must be an image'));
        }
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max per file
    },
  }).fields([
    { name: 'template', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
  ]);

  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'File upload error',
      });
    }
    next();
  });
};

// Middleware for company registration files (logo and document)
export const uploadCompanyFiles = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      // Logo must be image
      if (file.fieldname === 'logo') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Logo must be an image file'));
        }
      }
      // Document can be image or PDF
      else if (file.fieldname === 'document') {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Document must be an image or PDF file'));
        }
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file (larger for documents)
    },
  }).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ]);

  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'File upload error',
      });
    }
    next();
  });
};

// Middleware for company update files (logo and banner)
export const uploadCompanyUpdateFiles = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      // Both logo and banner must be images
      if (file.fieldname === 'logo' || file.fieldname === 'banner') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error(`${file.fieldname} must be an image file`));
        }
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
    },
  }).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]);

  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : 'File upload error',
      });
    }
    next();
  });
};

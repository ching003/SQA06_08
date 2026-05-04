import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize user input to prevent XSS attacks and other injection attacks
 * This middleware sanitizes all string values in request body, query params, and URL params
 */

// List of suspicious SQL keywords to log (not block, just monitor)
const SQL_KEYWORDS = [
    'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE',
    'EXEC', 'EXECUTE', 'SCRIPT', 'UNION', 'SELECT', '--', ';--', '/*', '*/'
];

/**
 * Check if a string contains suspicious SQL patterns
 */
function containsSuspiciousSQL(value: string): boolean {
    const upperValue = value.toUpperCase();
    return SQL_KEYWORDS.some(keyword => {
        // Check for SQL keywords surrounded by spaces or special chars
        const pattern = new RegExp(`(\\s|^|;)${keyword}(\\s|$|;)`, 'i');
        return pattern.test(upperValue);
    });
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHTML(value: string): string {
    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return value.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize a single string value
 */
function sanitizeString(value: string): string {
    // Remove null bytes
    let sanitized = value.replace(/\0/g, '');

    // Escape HTML to prevent XSS
    sanitized = escapeHTML(sanitized);

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Recursively sanitize an object's string values
 */
function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

/**
 * Express middleware to sanitize all inputs
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    try {
        // Track if we found suspicious patterns
        let foundSuspicious = false;
        const suspiciousPatterns: string[] = [];

        // Check and log suspicious SQL patterns in query params
        if (req.query) {
            Object.entries(req.query).forEach(([key, value]) => {
                if (typeof value === 'string' && containsSuspiciousSQL(value)) {
                    foundSuspicious = true;
                    suspiciousPatterns.push(`query.${key}: ${value}`);
                }
            });
        }

        // Check and log suspicious SQL patterns in body
        if (req.body) {
            Object.entries(req.body).forEach(([key, value]) => {
                if (typeof value === 'string' && containsSuspiciousSQL(value)) {
                    foundSuspicious = true;
                    suspiciousPatterns.push(`body.${key}: ${value}`);
                }
            });
        }

        // Log suspicious patterns (for monitoring/alerting)
        if (foundSuspicious) {
            console.warn('⚠️  Suspicious input detected:', {
                ip: req.ip,
                url: req.originalUrl,
                method: req.method,
                patterns: suspiciousPatterns,
                timestamp: new Date().toISOString(),
            });
        }

        // Sanitize query parameters
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }

        // Sanitize request body
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize URL parameters
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('Error in sanitization middleware:', error);
        // Don't block the request on sanitization errors, just log and continue
        next();
    }
}

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import type { IPDFService } from '../../domain/services/IPDFService.js';

export class PDFService implements IPDFService {
  async generatePDF(html: string): Promise<Buffer> {
    // Use system Chromium if PUPPETEER_EXECUTABLE_PATH is set, otherwise use bundled Chrome
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  renderTemplate(templateHtml: string, data: Record<string, any>): string {
    // Register Handlebars helpers
    Handlebars.registerHelper('formatDate', (date: Date | string | null | undefined) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
    });

    Handlebars.registerHelper('formatFullDate', (date: Date | string | null | undefined) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    });

    Handlebars.registerHelper('translateSkillLevel', (level: string | null | undefined) => {
      if (!level) return '';
      const translations: Record<string, string> = {
        'BEGINNER': 'Cơ bản',
        'INTERMEDIATE': 'Trung bình',
        'ADVANCED': 'Nâng cao',
        'EXPERT': 'Chuyên gia',
      };
      return translations[level] || level;
    });

    Handlebars.registerHelper('getSkillProgress', (level: string | null | undefined) => {
      if (!level) return '0';
      const progress: Record<string, string> = {
        'BEGINNER': '25',
        'INTERMEDIATE': '50',
        'ADVANCED': '75',
        'EXPERT': '100',
      };
      return progress[level] || '0';
    });

    Handlebars.registerHelper('translateLanguageLevel', (level: string | null | undefined) => {
      if (!level) return '';
      const translations: Record<string, string> = {
        'BASIC': 'Cơ bản',
        'CONVERSATIONAL': 'Giao tiếp',
        'FLUENT': 'Thành thạo',
        'NATIVE': 'Bản ngữ',
      };
      return translations[level] || level;
    });

    Handlebars.registerHelper('formatDateHarvard', (date: Date | string | null | undefined) => {
      if (!date) return '';
      const d = new Date(date);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${month} ${year}`;
    });

    Handlebars.registerHelper('ifCond', function (this: any, v1: any, operator: string, v2: any, options: any) {
      switch (operator) {
        case '==':
          return v1 == v2 ? options.fn(this) : options.inverse(this);
        case '===':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '!=':
          return v1 != v2 ? options.fn(this) : options.inverse(this);
        case '!==':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '<':
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case '&&':
          return v1 && v2 ? options.fn(this) : options.inverse(this);
        case '||':
          return v1 || v2 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });

    const template = Handlebars.compile(templateHtml);
    return template(data);
  }
}

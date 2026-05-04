export interface IPDFService {
  generatePDF(html: string): Promise<Buffer>;
  renderTemplate(templateHtml: string, data: Record<string, any>): string;
}

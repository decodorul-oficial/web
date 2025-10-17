'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, File, ChevronDown, Loader2, Check, Lock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ExportButtonProps {
  newsId: string;
  newsTitle: string;
  newsContent: {
    summary?: string;
    body?: string;
    author?: string;
    category?: string;
    keywords?: string[];
    publicationDate: string;
    sourceUrl?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  tooltipDirection?: 'up' | 'right';
}

export function ExportButton({ 
  newsId, 
  newsTitle, 
  newsContent,
  className = '',
  size = 'md',
  showLabel = false,
  tooltipDirection = 'up'
}: ExportButtonProps) {
  const { isAuthenticated, hasPremiumAccess, loading: authLoading } = useAuth();
  const { consent, isLoaded: consentLoaded } = useConsent();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'word' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        setTooltipText('Conectează-te pentru a exporta');
      } else if (!hasPremiumAccess) {
        setTooltipText('Abonament premium necesar');
      } else if (!consent) {
        setTooltipText('Acceptă cookie-urile pentru a exporta');
      } else {
        setTooltipText('Exportă articolul');
      }
    }
  }, [isClient, isAuthenticated, hasPremiumAccess, consent]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const cleanHtmlContent = (html: string) => {
    // Remove script tags and other unwanted elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script tags
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove style tags
    const styles = tempDiv.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    // Remove interactive elements
    const interactiveElements = tempDiv.querySelectorAll('button, input, select, textarea, form');
    interactiveElements.forEach(el => el.remove());
    
    return tempDiv.innerHTML;
  };

  // Helper function to parse HTML and convert to PDF formatting
  const parseHtmlToPdf = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const parseNode = (node: Node): Array<{text: string, isBold: boolean, isItalic: boolean}> => {
      const result: Array<{text: string, isBold: boolean, isItalic: boolean}> = [];
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          result.push({ text, isBold: false, isItalic: false });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Handle different HTML tags
        if (tagName === 'p' || tagName === 'div') {
          // Add line break before paragraph
          if (result.length > 0) {
            result.push({ text: '\n', isBold: false, isItalic: false });
          }
          // Parse children
          Array.from(node.childNodes).forEach(child => {
            result.push(...parseNode(child));
          });
          // Add line break after paragraph
          result.push({ text: '\n', isBold: false, isItalic: false });
        } else if (tagName === 'br') {
          result.push({ text: '\n', isBold: false, isItalic: false });
        } else if (tagName === 'strong' || tagName === 'b') {
          // Bold text
          Array.from(node.childNodes).forEach(child => {
            const childResult = parseNode(child);
            childResult.forEach(item => {
              result.push({ ...item, isBold: true });
            });
          });
        } else if (tagName === 'em' || tagName === 'i') {
          // Italic text
          Array.from(node.childNodes).forEach(child => {
            const childResult = parseNode(child);
            childResult.forEach(item => {
              result.push({ ...item, isItalic: true });
            });
          });
        } else if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
          // Headers - add line break and make bold
          if (result.length > 0) {
            result.push({ text: '\n', isBold: false, isItalic: false });
          }
          Array.from(node.childNodes).forEach(child => {
            const childResult = parseNode(child);
            childResult.forEach(item => {
              result.push({ ...item, isBold: true });
            });
          });
          result.push({ text: '\n', isBold: false, isItalic: false });
        } else if (tagName === 'ul' || tagName === 'ol') {
          // Lists
          Array.from(node.childNodes).forEach((child, index) => {
            if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
              const prefix = tagName === 'ol' ? `${index + 1}. ` : '• ';
              result.push({ text: prefix, isBold: false, isItalic: false });
              Array.from(child.childNodes).forEach(grandChild => {
                result.push(...parseNode(grandChild));
              });
              result.push({ text: '\n', isBold: false, isItalic: false });
            }
          });
        } else if (tagName === 'li') {
          // List items
          Array.from(node.childNodes).forEach(child => {
            result.push(...parseNode(child));
          });
        } else {
          // For other tags, just parse children
          Array.from(node.childNodes).forEach(child => {
            result.push(...parseNode(child));
          });
        }
      }
      
      return result;
    };
    
    return parseNode(tempDiv);
  };

  const ensureProperEncoding = (text: string) => {
    // Ensure proper Romanian diacritics encoding for PDF
    return text
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/Ă/g, 'A')
      .replace(/Â/g, 'A')
      .replace(/Î/g, 'I')
      .replace(/Ș/g, 'S')
      .replace(/Ț/g, 'T');
  };

  const ensureProperEncodingForWord = (text: string) => {
    // Fix diacritics for Word documents
    return text
      .replace(/ă/g, 'ă')
      .replace(/â/g, 'â')
      .replace(/î/g, 'î')
      .replace(/ș/g, 'ș')
      .replace(/ț/g, 'ț')
      .replace(/Ă/g, 'Ă')
      .replace(/Â/g, 'Â')
      .replace(/Î/g, 'Î')
      .replace(/Ș/g, 'Ș')
      .replace(/Ț/g, 'Ț');
  };

  const generatePDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    
    try {
      // Create PDF with proper A4 format
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 7.5; // Reduced margins by 50%
      const footerHeight = 25; // Footer height
      const availableHeight = pageHeight - (margin * 2) - footerHeight;
      
      let currentY = margin;
      let currentPage = 1;
      
      // Brand colors from Tailwind config
      const brandColors = {
        brand: '#0B132B',
        accent: '#1C2541', 
        highlight: '#3A506B',
        info: '#38a8a5', // Turcoaz
        soft: '#A1C6EA'
      };
      
      // Helper function to add text with automatic page breaks and proper diacritics
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#0B132B') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal'); 
        pdf.setTextColor(color);
        
        // Fix diacritics by replacing them with proper characters for PDF
        const fixedText = text
          .replace(/ă/g, 'a')
          .replace(/â/g, 'a')
          .replace(/î/g, 'i')
          .replace(/ș/g, 's')
          .replace(/ț/g, 't')
          .replace(/Ă/g, 'A')
          .replace(/Â/g, 'A')
          .replace(/Î/g, 'I')
          .replace(/Ș/g, 'S')
          .replace(/Ț/g, 'T');
        
        const lines = pdf.splitTextToSize(fixedText, pageWidth - (margin * 2));
        
        for (const line of lines) {
          if (currentY + 5 > pageHeight - margin - footerHeight) {
            // Add footer to current page
            addFooter(currentPage);
            
            // Start new page
            pdf.addPage();
            currentPage++;
            currentY = margin;
          }
          
          pdf.text(line, margin, currentY);
          currentY += 5;
        }
      };

      // Helper function to add formatted HTML content to PDF
      const addFormattedHtml = (html: string, fontSize: number, color: string = '#0B132B') => {
        const parsedContent = parseHtmlToPdf(html);
        
        for (const item of parsedContent) {
          if (item.text === '\n') {
            currentY += 3; // Line break spacing
            continue;
          }
          
          if (currentY + 5 > pageHeight - margin - footerHeight) {
            // Add footer to current page
            addFooter(currentPage);
            
            // Start new page
            pdf.addPage();
            currentPage++;
            currentY = margin;
          }
          
          // Set font style based on formatting
          pdf.setFontSize(fontSize);
          pdf.setFont('helvetica', item.isBold ? 'bold' : 'normal');
          pdf.setTextColor(color);
          
          // Fix diacritics
          const fixedText = item.text
            .replace(/ă/g, 'a')
            .replace(/â/g, 'a')
            .replace(/î/g, 'i')
            .replace(/ș/g, 's')
            .replace(/ț/g, 't')
            .replace(/Ă/g, 'A')
            .replace(/Â/g, 'A')
            .replace(/Î/g, 'I')
            .replace(/Ș/g, 'S')
            .replace(/Ț/g, 'T');
          
          const lines = pdf.splitTextToSize(fixedText, pageWidth - (margin * 2));
          
          for (const line of lines) {
            if (currentY + 5 > pageHeight - margin - footerHeight) {
              // Add footer to current page
              addFooter(currentPage);
              
              // Start new page
              pdf.addPage();
              currentPage++;
              currentY = margin;
            }
            
            pdf.text(line, margin, currentY);
            currentY += 5;
          }
        }
      };
      
      // Helper function to add gradient header with brand-info to brand-accent gradient
      const addGradientHeader = (text: string, fontSize: number = 12) => {
        // Create gradient effect from brand-info to brand-accent
        const gradientWidth = pageWidth - (margin * 2);
        const gradientHeight = 12; // Increased height for padding
        
        // Draw gradient background (simulate with multiple rectangles)
        for (let i = 0; i < gradientWidth; i += 2) {
          const ratio = i / gradientWidth;
          // From brand-info (#38a8a5) to brand-accent (#1C2541)
          const r = Math.round(56 + (28 - 56) * ratio); // 56 to 28
          const g = Math.round(168 + (37 - 168) * ratio); // 168 to 37
          const b = Math.round(165 + (65 - 165) * ratio); // 165 to 65
          
          pdf.setFillColor(r, g, b);
          pdf.rect(margin + i, currentY - 6, 2, gradientHeight, 'F');
        }
        
        // Fix diacritics for header text
        const fixedText = text
          .replace(/ă/g, 'a')
          .replace(/â/g, 'a')
          .replace(/î/g, 'i')
          .replace(/ș/g, 's')
          .replace(/ț/g, 't')
          .replace(/Ă/g, 'A')
          .replace(/Â/g, 'A')
          .replace(/Î/g, 'I')
          .replace(/Ș/g, 'S')
          .replace(/Ț/g, 'T');
        
        // Add text with proper font and padding (equivalent to p-4 mb-5)
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold'); 
        pdf.setTextColor(255, 255, 255);
        pdf.text(fixedText, margin + 12, currentY); // 16px padding (4 * 4)
        
        currentY += 12; // 12px height + 5px margin bottom (equivalent to mb-5)
      };
      
      // Helper function to add footer
      const addFooter = (pageNum: number) => {
        // Footer background
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
        
        // Footer border with brand color
        pdf.setDrawColor(56, 168, 165); // brand.info
        pdf.setLineWidth(0.5);
        pdf.line(0, pageHeight - footerHeight, pageWidth, pageHeight - footerHeight);
        
        // Footer content
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal'); 
        pdf.setTextColor(100, 100, 100);
        
        // Copyright and generation date (left side)
        pdf.text(`© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || 'Decodorul Oficial'}. Toate drepturile rezervate.`, margin, pageHeight - 15);
        pdf.text(`Document generat la data de: ${new Date().toLocaleDateString('ro-RO')}`, margin, pageHeight - 8);
        
        // Page number (right side)
        pdf.text(`Pagina ${pageNum}`, pageWidth - margin - 20, pageHeight - 8);
      };
      
      // Add header with logo and site name - TRANSPARENT background
      // No background fill - transparent header
      
      // Add logo (if available)
      try {
        const logoResponse = await fetch('/logo.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
          
          // Add logo (small size)
          // Original logo size: 64x77. To fit max height 16, width = 16 * (64/77) ≈ 13.3
          pdf.addImage(logoDataUrl, 'PNG', margin, 2, 13.3, 16);
        }
      } catch (error) {
        console.log('Logo not found, using text only');
      }
      
      // Add site name with proper font - BLACK text on transparent background
      pdf.setFontSize(14);
      // Use a sans-serif font for the site name (closest available in jsPDF is 'helvetica')
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(11, 19, 43); // brand.DEFAULT - black text
      pdf.text(process.env.NEXT_PUBLIC_SITE_NAME || 'Decodorul Oficial', margin + 20, 12);

      // Add PRO badge with brand colors
      pdf.setFillColor(56, 168, 165); // brand.info - turquoise
      pdf.rect(pageWidth - 25, 5, 20, 10, 'F');
      pdf.setFontSize(8);
      // Use a sans-serif font for the badge as well
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('PRO', pageWidth - 20, 11);
      currentY = 30;
      
      // Add title with brand color
      addText(newsTitle, 16, true, brandColors.brand);
      currentY += 5;
      
      // Add separator line with brand color
      pdf.setDrawColor(56, 168, 165); // brand.info
      pdf.setLineWidth(1);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
      
      // Add meta information with brand styling
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, currentY - 5, pageWidth - (margin * 2), 25, 'F');
      
      addText(`Data publicării: ${formatDate(newsContent.publicationDate)}`, 12, true, brandColors.brand);
      if (newsContent.author) {
        addText(`Autor: ${newsContent.author}`, 12, false, brandColors.highlight);
      }
      if (newsContent.category) {
        addText(`Categoria: ${newsContent.category}`, 12, false, brandColors.highlight);
      }
      if (newsContent.sourceUrl) {
        addText(`Sursa originală: ${newsContent.sourceUrl}`, 12, false, brandColors.info);
      }
      
      currentY += 15;
      
      // Add summary if available
      if (newsContent.summary) {
        // Summary header with gradient
        addGradientHeader('Sinteză', 12);
        
        // Summary content
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, currentY - 5, pageWidth - (margin * 2), 20, 'F');
        pdf.setTextColor(11, 19, 43); // brand.DEFAULT
        addText(newsContent.summary, 12, false, brandColors.brand);
        currentY += 10;
      }
      
      // Add body content if available
      if (newsContent.body) {
        // Content header with gradient
        addGradientHeader('Conținut', 12);
        
        // Content body with HTML formatting
        const cleanedHtml = cleanHtmlContent(newsContent.body);
        addFormattedHtml(cleanedHtml, 12, brandColors.brand);
      }
      
      // Add footer to last page
      addFooter(currentPage);

      // Save the PDF
      const fileName = `${newsTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${newsId}.pdf`;
      pdf.save(fileName);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('A apărut o eroare la generarea PDF-ului. Te rugăm să încerci din nou.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowDropdown(false);
    }
  };

  const generateWord = async () => {
    setIsExporting(true);
    setExportType('word');
    
    try {
      // Brand colors from Tailwind config
      const brandColors = {
        brand: '0B132B',
        accent: '1C2541', 
        highlight: '3A506B',
        info: '38a8a5', // Turcoaz
        soft: 'A1C6EA'
      };
      
      // Helper function to parse HTML for Word formatting
      const parseHtmlForWord = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const parseNode = (node: Node): Array<{text: string, isBold: boolean, isItalic: boolean, isHeading: boolean, headingLevel?: number}> => {
          const result: Array<{text: string, isBold: boolean, isItalic: boolean, isHeading: boolean, headingLevel?: number}> = [];
          
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              result.push({ text, isBold: false, isItalic: false, isHeading: false });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            
            if (tagName === 'p' || tagName === 'div') {
              if (result.length > 0) {
                result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
              }
              Array.from(node.childNodes).forEach(child => {
                result.push(...parseNode(child));
              });
              result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
            } else if (tagName === 'br') {
              result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
            } else if (tagName === 'strong' || tagName === 'b') {
              Array.from(node.childNodes).forEach(child => {
                const childResult = parseNode(child);
                childResult.forEach(item => {
                  result.push({ ...item, isBold: true });
                });
              });
            } else if (tagName === 'em' || tagName === 'i') {
              Array.from(node.childNodes).forEach(child => {
                const childResult = parseNode(child);
                childResult.forEach(item => {
                  result.push({ ...item, isItalic: true });
                });
              });
            } else if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
              const headingLevel = parseInt(tagName.charAt(1));
              if (result.length > 0) {
                result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
              }
              Array.from(node.childNodes).forEach(child => {
                const childResult = parseNode(child);
                childResult.forEach(item => {
                  result.push({ ...item, isBold: true, isHeading: true, headingLevel });
                });
              });
              result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
            } else if (tagName === 'ul' || tagName === 'ol') {
              Array.from(node.childNodes).forEach((child, index) => {
                if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'li') {
                  const prefix = tagName === 'ol' ? `${index + 1}. ` : '• ';
                  result.push({ text: prefix, isBold: false, isItalic: false, isHeading: false });
                  Array.from(child.childNodes).forEach(grandChild => {
                    result.push(...parseNode(grandChild));
                  });
                  result.push({ text: '\n', isBold: false, isItalic: false, isHeading: false });
                }
              });
            } else if (tagName === 'li') {
              Array.from(node.childNodes).forEach(child => {
                result.push(...parseNode(child));
              });
            } else {
              Array.from(node.childNodes).forEach(child => {
                result.push(...parseNode(child));
              });
            }
          }
          
          return result;
        };
        
        return parseNode(tempDiv);
      };
      
      // Add logo to Word document
      let logoImageRun = null;
      try {
        const logoResponse = await fetch('/logo.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoArrayBuffer = await logoBlob.arrayBuffer();
          const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoArrayBuffer)));
          
          logoImageRun = new ImageRun({
            data: logoArrayBuffer,
            type: "png",
            transformation: {
              width: 64,
              height: 48, // Maintain aspect ratio (64x77 original, scaled down)
            },
          });
        }
      } catch (error) {
        console.log('Logo not found for Word, using text only');
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header with logo and site name - TRANSPARENT background
            new Paragraph({
              children: [
                ...(logoImageRun ? [logoImageRun] : []),
                new TextRun({
                  text: logoImageRun ? " " : "", // Space after logo
                  size: 28,
                }),
                new TextRun({
                  text: process.env.NEXT_PUBLIC_SITE_NAME || 'Decodorul Oficial',
                  bold: true,
                  size: 28,
                  color: brandColors.brand,
                  font: "Helvetica",
                }),
                new TextRun({
                  text: " PRO",
                  bold: true,
                  size: 20,
                  color: "FFFFFF",
                  font: "Helvetica",
                }),
              ],
              alignment: AlignmentType.LEFT,
              // No background shading - transparent header
            }),
            
            // Title with Helvetica font
            new Paragraph({
              children: [
                new TextRun({
                  text: ensureProperEncodingForWord(newsTitle),
                  bold: true,
                  size: 24,
                  color: brandColors.brand,
                  font: "Helvetica",
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.LEFT,
            }),
            
            // Separator line with brand color
            new Paragraph({
              children: [
                new TextRun({
                  text: "─".repeat(50),
                  color: brandColors.info,
                  font: "Helvetica",
                }),
              ],
              alignment: AlignmentType.LEFT,
            }),
            
            // Meta information with brand styling and Helvetica font
            new Paragraph({
              children: [
                new TextRun({
                  text: `Data publicării: ${formatDate(newsContent.publicationDate)}`,
                  size: 22,
                  bold: true,
                  color: brandColors.brand,
                  font: "Helvetica",
                }),
              ],
              shading: {
                type: "solid",
                color: "F8F9FA",
              },
            }),
            
            ...(newsContent.author ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Autor: ${newsContent.author}`,
                  size: 22,
                  color: brandColors.highlight,
                  font: "Helvetica",
                }),
              ],
              shading: {
                type: "solid",
                color: "F8F9FA",
              },
            })] : []),
            
            ...(newsContent.category ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Categoria: ${newsContent.category}`,
                  size: 22,
                  color: brandColors.highlight,
                  font: "Helvetica",
                }),
              ],
              shading: {
                type: "solid",
                color: "F8F9FA",
              },
            })] : []),
            
            ...(newsContent.sourceUrl ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Sursa originală: ${newsContent.sourceUrl}`,
                  size: 22,
                  color: brandColors.info,
                  font: "Helvetica",
                }),
              ],
              shading: {
                type: "solid",
                color: "F8F9FA",
              },
            })] : []),
            
            // Empty line
            new Paragraph({
              children: [new TextRun({ text: "" })],
            }),
            
            // Summary with gradient styling and Helvetica font
            ...(newsContent.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Sinteză",
                    bold: true,
                    size: 20,
                    color: "FFFFFF",
                    font: "Helvetica",
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                shading: {
                  type: "solid",
                  color: brandColors.info, // Gradient effect simulated with solid color
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: ensureProperEncodingForWord(newsContent.summary),
                    size: 22,
                    color: brandColors.brand,
                    font: "Helvetica",
                  }),
                ],
                shading: {
                  type: "solid",
                  color: "F8F9FA",
                },
              }),
            ] : []),
            
            // Body content with HTML formatting and Helvetica font
            ...(newsContent.body ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Conținut",
                    bold: true,
                    size: 20,
                    color: "FFFFFF",
                    font: "Helvetica",
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                shading: {
                  type: "solid",
                  color: brandColors.info, // Gradient effect simulated with solid color
                },
              }),
              // Parse HTML content for proper formatting
              ...parseHtmlForWord(cleanHtmlContent(newsContent.body))
                .filter(item => item.text.trim().length > 0)
                .map(item => {
                  if (item.isHeading && item.headingLevel) {
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: ensureProperEncodingForWord(item.text),
                          size: item.headingLevel <= 2 ? 20 : 18,
                          bold: true,
                          color: brandColors.brand,
                          font: "Helvetica",
                        }),
                      ],
                      heading: item.headingLevel === 1 ? HeadingLevel.HEADING_1 : 
                               item.headingLevel === 2 ? HeadingLevel.HEADING_2 : 
                               item.headingLevel === 3 ? HeadingLevel.HEADING_3 : 
                               item.headingLevel === 4 ? HeadingLevel.HEADING_4 : 
                               item.headingLevel === 5 ? HeadingLevel.HEADING_5 : HeadingLevel.HEADING_6,
                    });
                  } else {
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: ensureProperEncodingForWord(item.text),
                          size: 22,
                          bold: item.isBold,
                          italics: item.isItalic,
                          color: brandColors.brand,
                          font: "Helvetica",
                        }),
                      ],
                    });
                  }
                }),
            ] : []),
            
            // Empty line
            new Paragraph({
              children: [new TextRun({ text: "" })],
            }),
            
            // Footer with brand styling and Helvetica font
            new Paragraph({
              children: [
                new TextRun({
                  text: `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || 'Decodorul Oficial'}. Toate drepturile rezervate.`,
                  size: 18,
                  italics: true,
                  color: "666666",
                  font: "Helvetica",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Document generat la data de: ${new Date().toLocaleDateString('ro-RO')}`,
                  size: 18,
                  italics: true,
                  color: "666666",
                  font: "Helvetica",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const fileName = `${newsTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${newsId}.docx`;
      saveAs(blob, fileName);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('A apărut o eroare la generarea documentului Word. Te rugăm să încerci din nou.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowDropdown(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      return;
    }
    setShowDropdown(!showDropdown);
  };

  const handleMouseEnter = () => {
    if (isClient) {
      setTimeout(() => setShowTooltip(true), 200);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const baseClasses = `
    ${sizeClasses[size]}
    flex items-center justify-center
    rounded-lg
    transition-all duration-200
    border border-gray-200
    bg-white
    hover:shadow-md
    ${isAuthenticated && hasPremiumAccess && consent ? 'animate-pulse-brand border-brand-info' : ''}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand
    relative
    group
    ${isExporting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
    ${className}
  `;

  const iconClasses = `
    ${iconSizes[size]}
    transition-all duration-200
    ${isAuthenticated && hasPremiumAccess && consent ? 'text-brand-info' : 'text-gray-500'} group-hover:text-brand-info group-hover:scale-110
  `;

  if (!isClient || authLoading || !consentLoaded) {
    return (
      <div className={`${baseClasses} ${sizeClasses[size]}`}>
        <Download className={`${iconSizes[size]} text-gray-300`} />
      </div>
    );
  }

  // Hide button completely if no cookie consent
  if (!consent) {
    return null;
  }

  // Show locked state for non-authenticated or non-premium users
  if (!isAuthenticated || !hasPremiumAccess) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={baseClasses}
          disabled={true}
          aria-label={!isAuthenticated ? 'Conectează-te pentru a exporta' : 'Abonament premium necesar'}
          title={!isAuthenticated ? 'Conectează-te pentru a exporta' : 'Abonament premium necesar'}
        >
          <Lock className={`${iconSizes[size]} text-gray-400`} />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className={`absolute z-50 ${
            tooltipDirection === 'up' 
              ? '-top-10 left-1/2 transform -translate-x-1/2' 
              : 'left-full top-1/2 transform -translate-y-1/2 ml-2'
          }`}>
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {tooltipText}
              {tooltipDirection === 'up' ? (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              ) : (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
              )}
            </div>
          </div>
        )}

        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:inline">
            {!isAuthenticated ? 'Conectează-te' : 'Premium necesar'}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={baseClasses}
          disabled={isExporting}
          aria-label="Exportă articolul"
          title="Exportă articolul"
        >
          {isExporting ? (
            <Loader2 className={`${iconSizes[size]} animate-spin text-brand-info`} />
          ) : showSuccess ? (
            <Check className={`${iconSizes[size]} text-green-500`} />
          ) : (
            <Download className={iconClasses} />
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && !showDropdown && (
          <div className={`absolute z-50 ${
            tooltipDirection === 'up' 
              ? '-top-10 left-1/2 transform -translate-x-1/2' 
              : 'left-full top-1/2 transform -translate-y-1/2 ml-2'
          }`}>
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {tooltipText}
              {tooltipDirection === 'up' ? (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              ) : (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
              )}
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute z-50 top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              <button
                onClick={generatePDF}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>Exportă ca PDF</span>
                {isExporting && exportType === 'pdf' && (
                  <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                )}
              </button>
              <button
                onClick={generateWord}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <File className="w-4 h-4 text-blue-500" />
                <span>Exportă ca Word</span>
                {isExporting && exportType === 'word' && (
                  <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                )}
              </button>
            </div>
          </div>
        )}

        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
            Exportă
          </span>
        )}
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Documentul a fost exportat cu succes!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

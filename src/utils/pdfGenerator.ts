import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Resume } from '../types';
import { ResumeRenderer } from '../components/templates/ResumeRenderer';
import {
  normalizeDomColors,
  validateExportDomColors,
  sanitizeDocumentStylesheets
} from './colorNormalizer';

export interface PdfGenerationResult {
  success: boolean;
  filename: string;
  blob?: Blob;
  pageCount: number;
  error?: string;
  validationReport?: {
    valid: boolean;
    inspectedElementsCount: number;
    errorsCount: number;
  };
}

/**
 * Generates and downloads a high-fidelity, multi-page A4 PDF resume
 * matching the exact chosen template, styles, colors, and content.
 *
 * Utilizes html2canvas-pro with complete CSS Color Module Level 4/5 support (oklch, oklab, color())
 * along with pre-flight color normalization, style sanitization, and intelligent A4 page break slicing.
 */
export async function generateResumePdf(
  resume: Resume,
  templateId?: string
): Promise<PdfGenerationResult> {
  const selectedTemplate = templateId || resume.template_id || 'professional';

  // Format filename strictly as ${Candidate_Name}_Resume.pdf
  const rawName = (resume.personal_info?.fullName || 'Candidate').trim();
  const safeName = rawName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'Candidate';
  const filename = `${safeName}_Resume.pdf`;

  // Create isolated off-screen rendering container with fixed standard A4 width (794px at 96 DPI)
  const container = document.createElement('div');
  container.id = `pdf-export-scratchpad-${Date.now()}`;
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.pointerEvents = 'none';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'visible';

  // Inject safety override style inside scratchpad container
  const safetyStyle = document.createElement('style');
  safetyStyle.textContent = `
    #${container.id} *, #${container.id} *::before, #${container.id} *::after {
      --tw-ring-color: rgba(59, 130, 246, 0.5) !important;
      --tw-shadow-color: rgba(0, 0, 0, 0.1) !important;
      border-color: #cbd5e1;
      outline-color: transparent;
      text-decoration-color: currentColor;
    }
  `;
  container.appendChild(safetyStyle);
  document.body.appendChild(container);

  let root: any = null;

  try {
    // Mount the exact ResumeRenderer into the detached container
    root = createRoot(container);
    root.render(
      React.createElement(
        'div',
        {
          id: 'pdf-render-target',
          style: {
            width: '794px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            margin: '0',
            padding: '28px 36px',
            color: '#1e293b'
          }
        },
        React.createElement(ResumeRenderer, {
          resume,
          templateId: selectedTemplate,
          isPrintMode: true,
          elementId: 'pdf-renderer-inner-doc'
        })
      )
    );

    // Wait for React to mount, layout, and images/fonts to finish settling
    await new Promise((resolve) => setTimeout(resolve, 400));

    const renderTarget = (container.querySelector('#pdf-render-target') as HTMLElement) || container;

    // 1. Normalize all colors in the export DOM tree into sRGB / RGBA
    normalizeDomColors(renderTarget, window);

    // 2. Pre-flight validation check
    const preFlight = validateExportDomColors(renderTarget, window);
    if (!preFlight.valid) {
      console.info(
        `[PDF Pre-Flight] Auto-normalized ${preFlight.errors.length} modern color values before capture.`
      );
    }

    // 3. Capture clean high-resolution canvas with html2canvas-pro
    const canvas = await html2canvas(renderTarget, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      width: 794,
      onclone: (clonedDoc, clonedElement) => {
        // Sanitize any raw stylesheets in cloned document
        sanitizeDocumentStylesheets(clonedDoc, (clonedDoc.defaultView as Window) || window);

        // Inject high-priority overrides in cloned head for pseudo-elements and reset variables
        const clonedOverride = clonedDoc.createElement('style');
        clonedOverride.id = 'pdf-export-cloned-overrides';
        clonedOverride.textContent = `
          *, *::before, *::after {
            --tw-ring-color: rgba(59, 130, 246, 0.5) !important;
            --tw-shadow-color: rgba(0, 0, 0, 0.1) !important;
            border-color: #cbd5e1;
            outline-color: transparent;
            text-decoration-color: currentColor;
          }
        `;
        clonedDoc.head.appendChild(clonedOverride);

        // Normalize all elements inside html2canvas's cloned document
        const win = (clonedDoc.defaultView as Window) || window;
        normalizeDomColors(clonedElement, win);
        validateExportDomColors(clonedElement, win);
      }
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering produced an empty canvas.');
    }

    // Standard A4 dimensions: 210mm x 297mm
    const pdfWidthMm = 210;
    const pdfHeightMm = 297;
    const a4Ratio = pdfHeightMm / pdfWidthMm; // 1.4142857

    // Canvas pixels corresponding to one full A4 page
    const pageCanvasHeight = Math.floor(canvas.width * a4Ratio);

    // Collect natural break positions from DOM elements (sections, headers, cards)
    // to prevent cutting text halfway through a line or breaking headers
    const candidateBreakTops: number[] = [];
    let elementsToInspect: Element[] = [];
    try {
      elementsToInspect = Array.from(
        renderTarget.querySelectorAll(
          'section, header, footer, article, h2, h3, .p-3, [class*="p-3.5"], .p-4, .p-5, .p-6, .border-b-2, .rounded-xl, [data-section]'
        )
      );
    } catch (_) {
      elementsToInspect = Array.from(
        renderTarget.querySelectorAll('section, header, footer, article, h2, h3')
      );
    }
    const targetRect = renderTarget.getBoundingClientRect();

    elementsToInspect.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const relativeTop = rect.top - targetRect.top;
      // Convert to canvas coordinate system
      const canvasTop = Math.floor(relativeTop * (canvas.width / renderTarget.offsetWidth));
      if (canvasTop > 50 && !candidateBreakTops.includes(canvasTop)) {
        candidateBreakTops.push(canvasTop);
      }
    });

    candidateBreakTops.sort((a, b) => a - b);

    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let renderedCanvasY = 0;
    let pageIndex = 0;

    while (renderedCanvasY < canvas.height - 10) {
      const remainingHeight = canvas.height - renderedCanvasY;

      // Determine where this page should end
      let splitY: number;

      if (remainingHeight <= pageCanvasHeight) {
        // Fits entirely on this final page
        splitY = canvas.height;
      } else {
        // Ideal page boundary
        const idealSplitY = renderedCanvasY + pageCanvasHeight;
        // Search buffer: 78% to 100% of page height
        const bufferStart = renderedCanvasY + Math.floor(pageCanvasHeight * 0.78);

        // Find candidate split point
        const goodCandidates = candidateBreakTops.filter(
          (top) => top >= bufferStart && top <= idealSplitY
        );

        if (goodCandidates.length > 0) {
          // Use the highest suitable break candidate to avoid slicing mid-element
          splitY = goodCandidates[goodCandidates.length - 1];
        } else {
          splitY = idealSplitY;
        }
      }

      const sliceCanvasHeight = splitY - renderedCanvasY;
      if (sliceCanvasHeight <= 0) break;

      // Create slice canvas for this specific A4 page
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = pageCanvasHeight;

      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        // Fill pristine white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        // Draw the slice from the master canvas
        ctx.drawImage(
          canvas,
          0,
          renderedCanvasY,
          canvas.width,
          sliceCanvasHeight,
          0,
          0,
          canvas.width,
          sliceCanvasHeight
        );

        const pageImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);

        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Render onto full A4 page
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
      }

      pageIndex++;
      renderedCanvasY = splitY;
    }

    // Generate output blob
    const pdfBlob = pdf.output('blob');

    // Trigger instant browser download using direct anchor click
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        try {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 3000);
    } catch (triggerErr) {
      console.warn('Anchor download fallback, using pdf.save():', triggerErr);
      pdf.save(filename);
    }

    return {
      success: true,
      filename,
      blob: pdfBlob,
      pageCount: pageIndex,
      validationReport: {
        valid: preFlight.valid,
        inspectedElementsCount: preFlight.inspectedElementsCount,
        errorsCount: preFlight.errors.length
      }
    };
  } catch (error: any) {
    console.error('PDF Generation failed:', error);
    return {
      success: false,
      filename,
      pageCount: 0,
      error: error?.message || 'Unknown error occurred while generating PDF.'
    };
  } finally {
    // Clean up DOM and unmount React root
    if (root) {
      try {
        root.unmount();
      } catch (_) {}
    }
    if (container && container.parentNode) {
      try {
        container.parentNode.removeChild(container);
      } catch (_) {}
    }
  }
}

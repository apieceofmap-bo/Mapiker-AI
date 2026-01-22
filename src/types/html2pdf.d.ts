declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string | null;
      onclone?: (clonedDoc: Document, element?: HTMLElement) => void;
      ignoreElements?: (element: Element) => boolean;
      foreignObjectRendering?: boolean;
      removeContainer?: boolean;
      windowWidth?: number;
      windowHeight?: number;
      scrollX?: number;
      scrollY?: number;
    };
    jsPDF?: {
      unit?: "pt" | "mm" | "cm" | "in" | "px" | "pc" | "em" | "ex";
      format?: string | [number, number];
      orientation?: "portrait" | "landscape" | "p" | "l";
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(filename?: string): Promise<void>;
    toPdf(): Html2PdfInstance;
    output(type: "blob" | "dataurlstring" | "bloburl"): Promise<Blob | string>;
    outputPdf(type: "blob" | "dataurlstring" | "bloburl"): Promise<Blob | string>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2PdfInstance;

  export default html2pdf;
}

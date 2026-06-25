declare module "pdfmake/build/pdfmake" {
  type PdfDocument = {
    getBuffer: () => Promise<Uint8Array>;
  };

  type PdfMake = {
    addVirtualFileSystem: (vfs: Record<string, string>) => void;
    createPdf: (definition: unknown) => PdfDocument;
  };

  const pdfMake: PdfMake;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export default vfs;
}

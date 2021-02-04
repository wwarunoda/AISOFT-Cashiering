export interface FileExt extends File {
  key$?: string;
  fileExtension?: string;
  fileName?: string;
  uploadProgress?: number;
  downloadedUrl?: any;
  errorMessage?: any;
}

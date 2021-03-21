export interface FileExt extends File {
  fileKey?: string;
  fileExtension?: string;
  fileName?: string;
  uploadProgress?: number;
  downloadedUrl?: any;
  errorMessage?: any;
}

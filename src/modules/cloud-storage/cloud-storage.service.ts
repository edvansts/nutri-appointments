import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CloudStorageService {
  private blobServiceClient: BlobServiceClient;
  private pdfContainerClient: ContainerClient;

  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION,
    );
    this.pdfContainerClient = this.blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_PDF_CONTAINER,
    );
  }

  getBlobClient(pdfname: string): BlockBlobClient {
    const blobClient = this.pdfContainerClient.getBlockBlobClient(pdfname);

    return blobClient;
  }

  async uploadPdf({
    file,
    fileName,
  }: {
    fileName: string;
    file: Express.Multer.File;
  }) {
    try {
      const pdfName = `${randomUUID()}${fileName}`;

      const blobClient = this.getBlobClient(pdfName);
      const data = await blobClient.uploadData(file.buffer);

      return { data, pdfName };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async readPdf(filename: string) {
    try {
      const blobClient = this.getBlobClient(filename);
      const blob = await blobClient.download();

      return blob.readableStreamBody;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deletePdf(filename: string) {
    try {
      const blobClient = this.getBlobClient(filename);
      const blob = await blobClient.deleteIfExists();

      return blob.succeeded;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}

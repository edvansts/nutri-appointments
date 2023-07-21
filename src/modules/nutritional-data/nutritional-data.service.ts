import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cache } from 'cache-manager';
import { NutritionalData } from 'src/models/nutritional-data.model';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
import { PaginatedResponse } from '../common/response/paginated.response';
import { PaginationDto } from '../common/validators/pagination.dto';
import { CreateNutritionalDataParams } from './types';

@Injectable()
export class NutritionalDataService {
  constructor(
    @InjectModel(NutritionalData)
    private nutritionalDataModel: typeof NutritionalData,
    private readonly cloudStorageService: CloudStorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create({
    description,
    file,
    nutritionistId,
    patientId,
  }: CreateNutritionalDataParams) {
    const { pdfName } = await this.cloudStorageService.uploadPdf({
      fileName: file.filename || file.originalname,
      file,
    });

    const nutritionalData = await this.nutritionalDataModel.create({
      filename: pdfName,
      nutritionistId,
      patientId,
      description,
    });

    return nutritionalData;
  }

  async getFileById(id: string, patientId: string) {
    const nutritionalData = await this.nutritionalDataModel.findOne({
      where: { patientId, id },
    });

    if (!nutritionalData.id) {
      throw new NotFoundException('Dados não encontrados');
    }

    // const cachedFile = await this.cacheManager.get<NodeJS.ReadableStream>(
    //   nutritionalData.filename,
    // );

    // if (cachedFile) {
    //   return cachedFile;
    // }

    const file = await this.cloudStorageService.readPdf(
      nutritionalData.filename,
    );

    // await this.cacheManager.set(nutritionalData.filename, file, 60 * 60 * 4);

    return file;
  }

  async getByPatient(
    patientId: string,
    { limit, offset }: PaginationDto,
  ): Promise<PaginatedResponse<NutritionalData[]>> {
    const { count, rows } = await this.nutritionalDataModel.findAndCountAll({
      where: { patientId },
      limit,
      offset,
    });

    return {
      data: rows,
      totalCount: count,
    };
  }
}

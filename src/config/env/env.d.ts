import { Environment } from './validate';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: Environment;
    readonly PORT: number;
    readonly DB_HOST: string;
    readonly DB_PORT: number;
    readonly DB_USER: string;
    readonly DB_PASSWORD: string;
    readonly DB_NAME: string;
    readonly USER_AUTH_SECRET: string;
    readonly EXPO_ACCESS_TOKEN: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;
    readonly AZURE_STORAGE_CONNECTION: string;
    readonly AZURE_STORAGE_PDF_CONTAINER: string;
    readonly REDIS_PASSWORD: string;
    readonly REDIS_HOST: string;
    readonly REDIS_PORT: string;
    readonly MAIL_HOST: string;
    readonly MAIL_PORT: number;
    readonly MAIL_USER: string;
    readonly MAIL_PASSWORD: string;
  }
}

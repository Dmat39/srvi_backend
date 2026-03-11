import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { timezoneHelper } from './timezone.helper';

export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  return `${randomUUID()}${ext}`;
}

export function generateDirectory(config: ConfigService): any {
  const basePath = getBasePath(config);
  const date = timezoneHelper();
  const currentDate = date.toISOString().split('T')[0];
  const uploadDir = path.join(basePath, 'preincidencias', 'fotos', currentDate);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return { currentDate, uploadDir, date };
}

export function getResolvedFilePath(
  config: ConfigService,
  dynamicPath: string[] | string,
): string {
  const basePath = getBasePath(config);
  const sanitizedPath = Array.isArray(dynamicPath)
    ? path.join(...dynamicPath)
    : dynamicPath.replace(/^\/+/, '');
  const fullPath = path.resolve(
    basePath,
    'preincidencias',
    'fotos',
    sanitizedPath,
  );
  if (!fs.existsSync(fullPath))
    throw new NotFoundException(`Archivo no encontrado: ${sanitizedPath}`);
  return fullPath;
}

export function getOriginPath(
  config: ConfigService,
  sanitizedPath: string,
): string {
  const basePath = getBasePath(config);
  const fullPath = path.resolve(basePath, sanitizedPath);
  if (!fs.existsSync(fullPath))
    throw new NotFoundException(`Archivo no encontrado: ${sanitizedPath}`);
  return fullPath;
}

function getBasePath(config: ConfigService): string {
  const basePath = config.get<string>('FILES_PATH');
  if (!basePath)
    throw new InternalServerErrorException('Variable interna no definida');
  return basePath;
}

import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: any, acceptFile: boolean) => void,
) {
  const isImage = file.mimetype?.startsWith('image/');
  const isVideo = file.mimetype?.startsWith('video/');
  if (!isImage && !isVideo)
    return cb(
      new BadRequestException(
        'Solo se permiten archivos de tipo imagen o video',
      ),
      false,
    );
  cb(null, true);
}

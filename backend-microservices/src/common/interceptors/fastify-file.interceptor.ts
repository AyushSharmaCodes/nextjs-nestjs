import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  mixin,
  Type,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(
    protected readonly fieldName: string,
    protected readonly options?: { destination?: string },
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<FastifyRequest & { file?: any; body?: any }>();

    // If not a multipart request, let NestJS handle it normally
    if (!req.isMultipart || !req.isMultipart()) {
      return next.handle();
    }

    const parts = req.parts();
    const body: Record<string, any> = {};
    let fileObj: any = undefined;

    try {
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part.fieldname === this.fieldName) {
            const destDir = this.options?.destination || './uploads';

            // Ensure destination folder exists
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }

            const filename = `${uuidv4()}${path.extname(part.filename)}`;
            const filepath = path.join(destDir, filename);

            // Stream incoming file chunk by chunk directly to disk
            await pipeline(part.file, fs.createWriteStream(filepath));

            fileObj = {
              fieldname: part.fieldname,
              originalname: part.filename,
              encoding: part.encoding,
              mimetype: part.mimetype,
              destination: destDir,
              filename: filename,
              path: filepath,
              size: fs.statSync(filepath).size,
            };
          } else {
            // Discard unselected files so the socket doesn't block
            await part.toBuffer();
          }
        } else {
          // Parse regular form field
          body[part.fieldname] = part.value;
        }
      }
    } catch (err) {
      throw new BadRequestException(
        `File upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // Populate body and file fields back to Fastify request so NestJS decorators can read them
    req.body = { ...req.body, ...body };
    req.file = fileObj;

    return next.handle();
  }
}

/**
 * Drop-in FileInterceptor replacement for NestJS with Fastify
 */
export function FileInterceptor(
  fieldName: string,
  options?: { destination?: string },
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor extends FastifyFileInterceptor {
    constructor() {
      super(fieldName, options);
    }
  }
  return mixin(MixinInterceptor);
}

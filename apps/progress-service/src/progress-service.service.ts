import { Injectable } from '@nestjs/common';

@Injectable()
export class ProgressServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

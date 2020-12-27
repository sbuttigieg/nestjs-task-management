import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

// NOTE 1a: process.env.PORT is used to override the config when required
// NOTE 1b: to define a process.env, you place it before the start of the app
// NOTE 1c: example: PORT=3001 npm run start:dev or in package.json
// NOTE 2a: when NODE_ENV is in dev mode, we run enableCors() method
// NOTE 2b: so that we can access the backend from a frontend in another domain.
async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || serverConfig.port;
  process.env.NODE_ENV === 'development' ? app.enableCors() : null;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();

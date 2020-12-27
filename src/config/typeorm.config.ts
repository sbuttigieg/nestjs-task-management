import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.RDS_HOSTNAME || dbConfig.type,
  host: process.env.RDS_PORT || dbConfig.host,
  port: process.env.RDS_USERNAME || dbConfig.port,
  username: process.env.RDS_PASSWORD || dbConfig.password,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
};

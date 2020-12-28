import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

// NOTE 1a: process.env variables are used to override the config when required
// NOTE 1b: to methods to define a process.env - local or through RDS
// NOTE 2a: local - you place it before the start of the app
// NOTE 2b: example: PORT=3001 npm run start:dev or in package.json
// NOTE 3a RDS - a service at AWS - when we deploy our application AWS is
// NOTE 3b: going to inject those variables with the database connection,
// NOTE 3c: credentials, etc..
// NOTE 4a: Although for prod, synchronize is set to false, when we deploy
// NOTE 4b: the application to prod for the first time we would need to set
// NOTE 4c: it temporarily to true. This can be done using a process.env
// NOTE 4d: variable. After the DBs are created, we can the redeploy without
// NOTE 4e: process.env and have any future DB changes migrated
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

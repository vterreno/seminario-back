import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
    logging: true,
    entities: [
        path.join(__dirname, '/../database/core/**/*.entity{.ts,.js}'),
        path.join(__dirname, '/../resource/**/*.entity{.ts,.js}'),
    ],
    migrations: [
        path.join(__dirname, '/../database/migrations/*{.ts,.js}'),
    ],
};
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '../entity/Todo';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [Todo],
  migrations: [],
  subscribers: [],
});

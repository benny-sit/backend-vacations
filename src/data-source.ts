import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") { 
    dotenv.config({silent: true} as any);
}

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [__dirname + "/entity/*.ts"],
    migrations: [],
    subscribers: [],
})

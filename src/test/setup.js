import { MongoMemoryServer } from "mongodb-memory-server";

export default async function setup() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET ??= "test-secret-32-characters-long!!";

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.DB_URI = uri;
  process.env.DATABASE_URL = uri;
  globalThis.__MONGOD__ = mongod;
}

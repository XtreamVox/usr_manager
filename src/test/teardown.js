import mongoose from "mongoose";

export default async function teardown() {
  await mongoose.disconnect();
  await globalThis.__MONGOD__?.stop();
}

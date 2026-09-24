import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.MONGODB_MEMORY_PORT) || 27017;
const DB_NAME = "taskflow";

const main = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: PORT, dbName: DB_NAME },
  });

  console.log(`Embedded MongoDB running at ${mongod.getUri()}`);
  console.log("Connected to DB:", DB_NAME);
  console.log("Stop this process to shut down the database.");

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

void main();
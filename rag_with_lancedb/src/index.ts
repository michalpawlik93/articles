import "reflect-metadata";
import { configureContainer } from "./application/di";
import { TYPES } from "./application/tokens";
import { ConsoleApp } from "./application/console";
import { LanceDbClient } from "./infrastructure/lanceDb/lanceDbClient";

const run = async () => {
  const container = await configureContainer();
  const consoleApp = container.get<ConsoleApp>(TYPES.ConsoleApp);

  const shutdown = () => {
    const lanceDbClient = container.get<LanceDbClient>(TYPES.LanceDbClient);
    lanceDbClient.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await consoleApp.run();

  shutdown();
};

run().catch(async (error) => {
  console.error("Application failed to start", error);

  try {
    const container = await configureContainer();
    const lanceDbClient = container.get<LanceDbClient>(TYPES.LanceDbClient);
    lanceDbClient.disconnect();
  } catch (disconnectError) {
    console.error("Failed to disconnect LanceDB", disconnectError);
  }

  process.exit(1);
});

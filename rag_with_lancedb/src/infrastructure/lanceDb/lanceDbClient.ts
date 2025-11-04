import { inject, injectable } from "inversify";
import { connect, Connection } from "@lancedb/lancedb";
import type { AppConfiguration } from "../../application/configuration";
import { TYPES } from "../../application/tokens";

@injectable()
export class LanceDbClient {
  private connection: Connection | null = null;

  constructor(
    @inject(TYPES.AppConfig) private readonly config: AppConfiguration
  ) {}

  async connect(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await connect(this.config.lanceDb.path);
    }

    return this.connection;
  }

  getConnection(): Connection {
    const connection = this.connection;

    if (!connection) {
      throw new Error("LanceDB has not been connected yet.");
    }

    return connection;
  }

  disconnect(): void {
    const connection = this.connection;

    if (!connection) {
      return;
    }

    connection.close();
    this.connection = null;
  }
}

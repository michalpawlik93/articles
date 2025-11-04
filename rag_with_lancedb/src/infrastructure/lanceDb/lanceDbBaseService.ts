import { Table } from "@lancedb/lancedb";
import type { Schema } from "apache-arrow";
import { LanceDbClient } from "./lanceDbClient";

export interface LanceVectorSearchOptions {
  column: string;
  metric?: string;
  limit?: number;
}

export abstract class LanceDbBaseService<
  TDomain,
  TDocument extends Record<string, unknown>
> {
  protected constructor(
    private readonly client: LanceDbClient,
    private readonly tableName: string,
    private readonly schema: Schema
  ) {}

  protected abstract toDocument(model: TDomain): TDocument;

  protected abstract fromRecord(record: Record<string, unknown>): TDomain;

  protected async getTable(): Promise<Table> {
    const connection = this.client.getConnection();

    try {
      return await connection.openTable(this.tableName);
    } catch (error) {
      await connection.createEmptyTable(this.tableName, this.schema);
      return await connection.openTable(this.tableName);
    }
  }

  async createMany(models: TDomain[]): Promise<void> {
    if (!models.length) {
      return;
    }

    const table = await this.getTable();
    const documents = models.map((model) => this.toDocument(model));
    await table.add(documents);
  }

  async search(
    vector: number[],
    options: LanceVectorSearchOptions
  ): Promise<TDomain[]> {
    const table = await this.getTable();
    const query = table.search(vector) as any;

    if (options.metric) {
      query.distanceType(options.metric as never);
    }

    if (options.column) {
      query.column(options.column);
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    const results = (await query.toArray()) as Record<string, unknown>[];
    return results.map((record) => this.fromRecord(record));
  }

  async fullTextSearch(
    queryText: string,
    columns: string | string[],
    limit = 10
  ): Promise<TDomain[]> {
    const table = await this.getTable();
    const query = table.search(queryText) as any;
    const results = (await query.limit(limit).toArray()) as Record<
      string,
      unknown
    >[];

    return results.map((record) => this.fromRecord(record));
  }
}

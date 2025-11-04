import { inject, injectable } from "inversify";
import { SentenceModel } from "../../domain/SentenceModel";
import { DualEmbedding } from "../../domain/DualEmbedding";
import type { AppConfiguration } from "../../application/configuration";
import {
  createSentenceSchema,
  SENTENCE_TABLE_NAME,
  SentenceDocument,
} from "./schemas";
import {
  LanceDbBaseService,
  LanceVectorSearchOptions,
} from "./lanceDbBaseService";
import { LanceDbClient } from "./lanceDbClient";
import { TYPES } from "../../application/tokens";

@injectable()
export class SentenceLanceDbService extends LanceDbBaseService<
  SentenceModel,
  SentenceDocument
> {
  constructor(
    @inject(TYPES.LanceDbClient) client: LanceDbClient,
    @inject(TYPES.AppConfig) config: AppConfiguration
  ) {
    super(
      client,
      SENTENCE_TABLE_NAME,
      createSentenceSchema(config.transformers.textEmbeddingDimension)
    );
  }

  async flatVectorSearch(
    vector: number[],
    options: LanceVectorSearchOptions
  ): Promise<SentenceModel[]> {
    return this.search(vector, options);
  }

  async searchFullText(query: string, limit = 10): Promise<SentenceModel[]> {
    return super.fullTextSearch(query, "text", limit);
  }

  protected toDocument(model: SentenceModel): SentenceDocument {
    return {
      id: model.id,
      createdAt: model.createdAt,
      rawEmbeddings: model.embeddings.rawEmbedding,
      normalizedEmbeddings: model.embeddings.normalizedEmbedding,
      text: model.text,
    };
  }

  protected fromRecord(record: Record<string, unknown>): SentenceModel {
    const rawEmbeddings = (record.rawEmbeddings as number[]) ?? [];
    const normalizedEmbeddings =
      (record.normalizedEmbeddings as number[]) ?? [];
    const embedding: DualEmbedding = {
      rawEmbedding: rawEmbeddings,
      normalizedEmbedding:
        normalizedEmbeddings.length > 0
          ? normalizedEmbeddings
          : this.normalize(rawEmbeddings),
    };

    return {
      id: String(record.id ?? ""),
      createdAt: this.toDate(record.createdAt),
      text: String(record.text ?? ""),
      embeddings: embedding,
    };
  }

  private toDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "number") {
      return new Date(value);
    }

    if (typeof value === "string") {
      return new Date(value);
    }

    return new Date();
  }

  private normalize(vector: number[]): number[] {
    const norm = Math.sqrt(
      vector.reduce((acc, current) => acc + current * current, 0)
    );

    if (!norm || Number.isNaN(norm)) {
      return vector.map(() => 0);
    }

    return vector.map((value) => value / norm);
  }
}

import { inject, injectable } from "inversify";
import { ImageModel } from "../../domain/ImageModel";
import { DualEmbedding } from "../../domain/DualEmbedding";
import type { AppConfiguration } from "../../application/configuration";
import { createImageSchema, IMAGE_TABLE_NAME, ImageDocument } from "./schemas";
import {
  LanceDbBaseService,
  LanceVectorSearchOptions,
} from "./lanceDbBaseService";
import { LanceDbClient } from "./lanceDbClient";
import { TYPES } from "../../application/tokens";

@injectable()
export class ImageLanceDbService extends LanceDbBaseService<
  ImageModel,
  ImageDocument
> {
  constructor(
    @inject(TYPES.LanceDbClient) client: LanceDbClient,
    @inject(TYPES.AppConfig) config: AppConfiguration
  ) {
    super(
      client,
      IMAGE_TABLE_NAME,
      createImageSchema(config.transformers.imageEmbeddingDimension)
    );
  }

  async flatVectorSearch(
    vector: number[],
    options: LanceVectorSearchOptions
  ): Promise<ImageModel[]> {
    return this.search(vector, options);
  }

  protected toDocument(model: ImageModel): ImageDocument {
    return {
      id: model.id,
      createdAt: model.createdAt,
      rawEmbeddings: model.embeddings.rawEmbedding,
      normalizedEmbeddings: model.embeddings.normalizedEmbedding,
      imageName: model.imageName,
      imagePath: model.imagePath,
    };
  }

  protected fromRecord(record: Record<string, unknown>): ImageModel {
    const rawEmbeddings = (record.rawEmbeddings as number[]) ?? [];
    const normalizedEmbeddings =
      (record.normalizedEmbeddings as number[]) ?? [];
    const embedding: DualEmbedding = {
      rawEmbedding: rawEmbeddings,
      normalizedEmbedding: normalizedEmbeddings.length
        ? normalizedEmbeddings
        : this.normalize(rawEmbeddings),
    };

    return {
      id: String(record.id ?? ""),
      createdAt: this.toDate(record.createdAt),
      imageName: String(record.imageName ?? ""),
      imagePath: String(record.imagePath ?? ""),
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

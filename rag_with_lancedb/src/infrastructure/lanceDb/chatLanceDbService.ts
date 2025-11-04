import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import type { AppConfiguration } from "../../application/configuration";
import { LanceDbClient } from "./lanceDbClient";
import { createChatSchema, CHAT_TABLE_NAME, ChatDocument } from "./schemas";
import {
  LanceDbBaseService,
  LanceVectorSearchOptions,
} from "./lanceDbBaseService";
import { ChatMessageModel } from "../../domain/ChatMessageModel";

@injectable()
export class ChatLanceDbService extends LanceDbBaseService<
  ChatMessageModel,
  ChatDocument
> {
  constructor(
    @inject(TYPES.LanceDbClient) client: LanceDbClient,
    @inject(TYPES.AppConfig) config: AppConfiguration
  ) {
    super(
      client,
      CHAT_TABLE_NAME,
      createChatSchema(config.transformers.textEmbeddingDimension)
    );
  }

  async saveMessages(messages: ChatMessageModel[]): Promise<void> {
    if (!messages.length) {
      return;
    }

    await this.createMany(messages);
  }

  async flatVectorSearch(
    vector: number[],
    options: LanceVectorSearchOptions
  ): Promise<ChatMessageModel[]> {
    return this.search(vector, options);
  }

  protected toDocument(model: ChatMessageModel): ChatDocument {
    return {
      role: (model as any).role ?? "user",
      message: model.message,
      rawEmbedding: model.embeddings.rawEmbedding,
      normalizedEmbedding: model.embeddings.normalizedEmbedding,
    };
  }

  protected fromRecord(record: Record<string, unknown>): ChatMessageModel {
    const rawEmbedding = (record.rawEmbedding as number[]) ?? [];
    const normalizedEmbedding =
      (record.normalizedEmbedding as number[]) ?? this.normalize(rawEmbedding);

    return {
      role: (record.role as "user" | "assistant") ?? "user",
      message: String(record.message ?? ""),
      embeddings: {
        rawEmbedding,
        normalizedEmbedding,
      },
    };
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

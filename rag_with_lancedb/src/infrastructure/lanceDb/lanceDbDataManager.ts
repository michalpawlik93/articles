import { inject, injectable } from "inversify";
import { LanceDbClient } from "./lanceDbClient";
import { TYPES } from "../../application/tokens";
import type { AppConfiguration } from "../../application/configuration";
import * as lancedb from "@lancedb/lancedb";
import {
  createImageSchema,
  createSentenceSchema,
  createChatSchema,
  IMAGE_TABLE_NAME,
  SENTENCE_TABLE_NAME,
  CHAT_TABLE_NAME,
} from "./schemas";

@injectable()
export class LanceDbDataManager {
  constructor(
    @inject(TYPES.LanceDbClient) private readonly client: LanceDbClient,
    @inject(TYPES.AppConfig) private readonly config: AppConfiguration
  ) {}

  async initializeTables(): Promise<void> {
    const connection = this.client.getConnection();

    try {
      try {
        await connection.openTable(IMAGE_TABLE_NAME);
      } catch (error) {
        const imageSchema = createImageSchema(
          this.config.transformers.imageEmbeddingDimension
        );
        await connection.createEmptyTable(IMAGE_TABLE_NAME, imageSchema);
        console.log(`Created table: ${IMAGE_TABLE_NAME}`);
      }

      try {
        await connection.openTable(SENTENCE_TABLE_NAME);
      } catch (error) {
        const sentenceSchema = createSentenceSchema(
          this.config.transformers.textEmbeddingDimension
        );
        await connection.createEmptyTable(SENTENCE_TABLE_NAME, sentenceSchema);
        console.log(`Created table: ${SENTENCE_TABLE_NAME}`);
      }

      try {
        await connection.openTable(CHAT_TABLE_NAME);
      } catch (error) {
        const chatSchema = createChatSchema(
          this.config.transformers.textEmbeddingDimension
        );
        await connection.createEmptyTable(CHAT_TABLE_NAME, chatSchema);
        console.log(`Created table: ${CHAT_TABLE_NAME}`);
      }

      console.log("LanceDB tables initialized successfully");
    } catch (error) {
      console.error("Failed to initialize LanceDB tables:", error);
      throw error;
    }
  }

  async createIndexes(): Promise<void> {
    const connection = this.client.getConnection();

    try {
      const sentenceTable = await connection.openTable(SENTENCE_TABLE_NAME);
      await sentenceTable.createIndex("text", {
        config: lancedb.Index.fts({
          language: "English",
        }),
      });
    } catch (error) {
      console.error("Failed to create indexes:", error);
      throw error;
    }
  }
}

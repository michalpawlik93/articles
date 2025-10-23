import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { TextEmbeddingsService } from "./textEmbeddingsService";
import { ChatLanceDbService } from "../lanceDb/chatLanceDbService";
import type { ChatMessageModel } from "../../domain/ChatMessageModel";

@injectable()
export class ChatHistoryRetrievalService {
  constructor(
    @inject(TYPES.TextEmbeddingsService)
    private readonly textEmbeddingsService: TextEmbeddingsService,
    @inject(TYPES.ChatLanceDbService)
    private readonly chatLanceDbService: ChatLanceDbService,
  ) {}

  async retrieve(prompt: string, limit = 2): Promise<ChatMessageModel[]> {
    const embedding =
      await this.textEmbeddingsService.textToEmbedding(prompt);

    return this.chatLanceDbService.flatVectorSearch(
      embedding.normalizedEmbedding,
      {
        column: "normalizedEmbedding",
        metric: "cosine",
        limit,
      },
    );
  }
}

import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { TextEmbeddingsService } from "./textEmbeddingsService";
import { SentenceLanceDbService } from "../lanceDb/sentenceLanceDbService";
import type { SentenceModel } from "../../domain/SentenceModel";

@injectable()
export class SentenceRetrievalService {
  constructor(
    @inject(TYPES.TextEmbeddingsService)
    private readonly textEmbeddingsService: TextEmbeddingsService,
    @inject(TYPES.SentenceLanceDbService)
    private readonly sentenceLanceDbService: SentenceLanceDbService,
  ) {}

  async retrieve(prompt: string, limit = 2): Promise<SentenceModel[]> {
    const embedding =
      await this.textEmbeddingsService.textToEmbedding(prompt);

    return this.sentenceLanceDbService.flatVectorSearch(
      embedding.normalizedEmbedding,
      {
        column: "normalizedEmbeddings",
        metric: "cosine",
        limit,
      },
    );
  }
}

import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { ImageEmbeddingService } from "./imageEmbeddingService";
import { ImageLanceDbService } from "../lanceDb/imageLanceDbService";
import type { ImageModel } from "../../domain/ImageModel";

@injectable()
export class ImageRetrievalService {
  constructor(
    @inject(TYPES.ImageEmbeddingService)
    private readonly imageEmbeddingService: ImageEmbeddingService,
    @inject(TYPES.ImageLanceDbService)
    private readonly imageLanceDbService: ImageLanceDbService
  ) {}

  async retrieve(prompt: string, limit = 2): Promise<ImageModel[]> {
    const embedding =
      await this.imageEmbeddingService.textQueryToImageSpaceEmbedding(prompt);
    return this.imageLanceDbService.flatVectorSearch(
      embedding.normalizedEmbedding,
      {
        column: "normalizedEmbeddings",
        metric: "cosine",
        limit,
      }
    );
  }
}

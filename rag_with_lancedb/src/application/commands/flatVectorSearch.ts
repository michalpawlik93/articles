import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { ImageEmbeddingService } from "../../infrastructure/embeddings/imageEmbeddingService";
import { TextEmbeddingsService } from "../../infrastructure/embeddings/textEmbeddingsService";
import { ImageLanceDbService } from "../../infrastructure/lanceDb/imageLanceDbService";
import { SentenceLanceDbService } from "../../infrastructure/lanceDb/sentenceLanceDbService";

@injectable()
export class FlatVectorSearchCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.ImageEmbeddingService)
    private readonly imageEmbeddingService: ImageEmbeddingService,
    @inject(TYPES.TextEmbeddingsService)
    private readonly textEmbeddingsService: TextEmbeddingsService,
    @inject(TYPES.ImageLanceDbService)
    private readonly imageLanceDbService: ImageLanceDbService,
    @inject(TYPES.SentenceLanceDbService)
    private readonly sentenceLanceDbService: SentenceLanceDbService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    const dataset = (
      await io.question("Select dataset (image/sentence): ")
    ).trim();

    if (!dataset) {
      io.println("\nDataset selection is required.");
      return;
    }
    const effectiveLimit = 5;

    if (dataset.toLowerCase().startsWith("image")) {
      await this.searchImages(io, effectiveLimit);
    } else if (dataset.toLowerCase().startsWith("sentence")) {
      await this.searchSentences(io, effectiveLimit);
    } else {
      io.println("\nUnsupported dataset option.");
    }
  }

  private async searchImages(io: ConsoleIO, limit: number): Promise<void> {
    const query = (await io.question("Text query for image search: ")).trim();

    if (!query) {
      io.println("\nQuery is required.");
      return;
    }

    try {
      const embeddings =
        await this.imageEmbeddingService.textQueryToImageSpaceEmbedding(query);

      const results = await this.imageLanceDbService.flatVectorSearch(
        embeddings.normalizedEmbedding,
        {
          column: "normalizedEmbeddings",
          metric: "cosine",
          limit,
        }
      );

      if (!results.length) {
        io.println("\nNo similar images found.");
        return;
      }

      io.println(`\nFound ${results.length} similar image(s):`);
      for (const result of results) {
        io.println(
          `- [${result.id}] ${result.imageName} (${result.imagePath})`
        );
      }
      io.println("");
    } catch (error) {
      io.println(
        `\nImage search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async searchSentences(io: ConsoleIO, limit: number): Promise<void> {
    const sentence = (await io.question("Sentence: ")).trim();

    if (!sentence) {
      io.println("\nSentence is required.");
      return;
    }

    try {
      const embeddings = await this.textEmbeddingsService.textToEmbedding(
        sentence
      );

      const results = await this.sentenceLanceDbService.flatVectorSearch(
        embeddings.normalizedEmbedding,
        {
          column: "normalizedEmbeddings",
          metric: "cosine",
          limit,
        }
      );

      if (!results.length) {
        io.println("\nNo similar sentences found.");
        return;
      }

      io.println(`\nFound ${results.length} similar sentence(s):`);
      for (const result of results) {
        io.println(`- [${result.id}] ${result.text}`);
      }
      io.println("");
    } catch (error) {
      io.println(
        `\nSentence search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

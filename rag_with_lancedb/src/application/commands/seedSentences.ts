import { inject, injectable } from "inversify";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { TextEmbeddingsService } from "../../infrastructure/embeddings/textEmbeddingsService";
import { SentenceLanceDbService } from "../../infrastructure/lanceDb/sentenceLanceDbService";
import { SentenceModel } from "../../domain/SentenceModel";

@injectable()
export class SeedSentencesCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.TextEmbeddingsService)
    private readonly textEmbeddingsService: TextEmbeddingsService,
    @inject(TYPES.SentenceLanceDbService)
    private readonly sentenceLanceDbService: SentenceLanceDbService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    try {
      const sentencesFilePath = path.join(
        process.cwd(),
        "seedFiles",
        "sentences",
        "sentences.ts"
      );
      const fileUrl =
        pathToFileURL(sentencesFilePath).href + `?update=${Date.now()}`;
      const sentencesModule = await import(fileUrl);
      const sentences = sentencesModule.sentences;

      if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
        io.println("\nNo sentences found in seedFiles/sentences/sentences.ts");
        return;
      }

      io.println(
        `\nFound ${sentences.length} sentence(s) in seedFiles/sentences/sentences.ts\n`
      );

      const models: SentenceModel[] = [];

      for (const sentence of sentences) {
        try {
          const embeddings = await this.textEmbeddingsService.textToEmbedding(
            sentence
          );
          models.push({
            id: randomUUID(),
            text: sentence,
            embeddings,
            createdAt: new Date(),
          });
        } catch (error) {
          io.println(
            `\nFailed to embed sentence "${sentence}": ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      if (!models.length) {
        io.println("\nNo sentences were seeded.");
        return;
      }

      await this.sentenceLanceDbService.createMany(models);
      io.println(
        `\nSuccessfully seeded ${models.length} sentence(s) into LanceDB.\n`
      );
    } catch (error) {
      io.println(
        `\nFailed to load sentences from file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

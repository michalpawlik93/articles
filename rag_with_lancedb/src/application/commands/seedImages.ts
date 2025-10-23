import { inject, injectable } from "inversify";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { ImageEmbeddingService } from "../../infrastructure/embeddings/imageEmbeddingService";
import { ImageLanceDbService } from "../../infrastructure/lanceDb/imageLanceDbService";
import { ImageModel } from "../../domain/ImageModel";

@injectable()
export class SeedImagesCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.ImageEmbeddingService)
    private readonly imageEmbeddingService: ImageEmbeddingService,
    @inject(TYPES.ImageLanceDbService)
    private readonly imageLanceDbService: ImageLanceDbService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    const imagesDir = path.join(process.cwd(), "seedFiles", "images");

    try {
      const files = await readdir(imagesDir);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
      );

      if (!imageFiles.length) {
        io.println("\nNo image files found in seedFiles/images directory.");
        return;
      }

      io.println(
        `\nFound ${imageFiles.length} image(s) in seedFiles/images directory.\n`
      );

      const paths = imageFiles.map((file) => path.join(imagesDir, file));

      const models: ImageModel[] = [];

      for (const imagePath of paths) {
        try {
          const embeddings = await this.imageEmbeddingService.imageToEmbedding(
            imagePath
          );

          const model: ImageModel = {
            id: randomUUID(),
            imageName: path.basename(imagePath),
            imagePath,
            embeddings,
            createdAt: new Date(),
          };

          models.push(model);
        } catch (error) {
          io.println(
            `\nFailed to process ${imagePath}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      if (!models.length) {
        io.println("\nNo images were seeded.");
        return;
      }

      await this.imageLanceDbService.createMany(models);
      io.println(
        `\nSuccessfully seeded ${models.length} image(s) into LanceDB.\n`
      );
    } catch (error) {
      io.println(
        `\nFailed to read images directory: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

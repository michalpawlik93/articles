import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { TransformersClient } from "../transformers/transformersClient";
import { RawImage } from "@xenova/transformers";
import { DualEmbedding } from "../../domain/DualEmbedding";

@injectable()
export class ImageEmbeddingService {
  constructor(
    @inject(TYPES.TransformersClient)
    private readonly transformersClient: TransformersClient
  ) {}

  async imageToEmbedding(imagePathOrUrl: string): Promise<DualEmbedding> {
    const processor = await this.transformersClient.getVisionProcessor();
    const visionModel = await this.transformersClient.getVisionModel();

    const image = await RawImage.read(imagePathOrUrl);
    const inputs = await processor(image);
    const { image_embeds } = await visionModel(inputs);
    const rawEmbedding = Array.from(image_embeds.data as Float32Array);
    return {
      rawEmbedding,
      normalizedEmbedding: this.normalize(rawEmbedding),
    };
  }

  // Produce a text embedding in the same space as image embeddings (CLIP-like cross-modal search)
  async textQueryToImageSpaceEmbedding(text: string): Promise<DualEmbedding> {
    const tokenizer = await this.transformersClient.getClipTokenizer();
    const textModel = await this.transformersClient.getClipTextModel();
    const inputs = tokenizer(text, { padding: "max_length", truncation: true });
    const { text_embeds } = await textModel(inputs);
    const rawEmbedding = Array.from(text_embeds.data as Float32Array);
    return {
      rawEmbedding,
      normalizedEmbedding: this.normalize(rawEmbedding),
    };
  }
  private normalize(vector: number[]): number[] {
    const norm = Math.sqrt(
      vector.reduce((acc, value) => acc + value * value, 0)
    );

    if (!norm || Number.isNaN(norm)) {
      return vector.map(() => 0);
    }

    return vector.map((value) => value / norm);
  }
}

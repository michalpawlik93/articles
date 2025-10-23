import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { TransformersClient } from "../transformers/transformersClient";
import { DualEmbedding } from "../../domain/DualEmbedding";

@injectable()
export class TextEmbeddingsService {
  constructor(
    @inject(TYPES.TransformersClient)
    private readonly transformersClient: TransformersClient,
  ) {}

  async textToEmbedding(text: string): Promise<DualEmbedding> {
    const pipeline = await this.transformersClient.getTextEmbeddingPipeline();
    const result = await pipeline(text, {
      pooling: "mean",
      normalize: false,
    });

    const rawEmbedding = this.extractVector(result);

    return {
      rawEmbedding,
      normalizedEmbedding: this.normalize(rawEmbedding),
    };
  }

  private extractVector(result: unknown): number[] {
    if (
      typeof result === "object" &&
      result !== null &&
      "data" in result &&
      (result as { data: Float32Array | number[] }).data
    ) {
      const { data } = result as { data: Float32Array | number[] };
      return Array.isArray(data) ? data : Array.from(data);
    }

    if (Array.isArray(result)) {
      const flattened = result.flat(Infinity);
      return flattened.filter(
        (value): value is number => typeof value === "number",
      );
    }

    throw new Error("Unable to convert text embedding result into a vector.");
  }

  private normalize(vector: number[]): number[] {
    const norm = Math.sqrt(
      vector.reduce((acc, value) => acc + value * value, 0),
    );

    if (!norm || Number.isNaN(norm)) {
      return vector.map(() => 0);
    }

    return vector.map((value) => value / norm);
  }
}

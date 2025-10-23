import { DualEmbedding } from "./DualEmbedding";

export interface ImageModel {
  id: string;
  imageName: string;
  imagePath: string;
  embeddings: DualEmbedding;
  createdAt: Date;
}

import { DualEmbedding } from "./DualEmbedding";

export interface SentenceModel {
  id: string;
  text: string;
  embeddings: DualEmbedding;
  createdAt: Date;
}

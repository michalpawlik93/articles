import { DualEmbedding } from "./DualEmbedding";

export interface ChatMessageModel {
  role: "user" | "assistant";
  message: string;
  embeddings: DualEmbedding;
}

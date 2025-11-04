import * as dotenv from "dotenv";

dotenv.config();

export interface TransformersConfiguration {
  imageEmbeddingModel: string;
  imageEmbeddingDimension: number;
  textEmbeddingModel: string;
  textEmbeddingDimension: number;
  chatModel: string;
}

export interface LanceDbConfiguration {
  path: string;
}

export interface AppConfiguration {
  transformers: TransformersConfiguration;
  lanceDb: LanceDbConfiguration;
}

const defaults: AppConfiguration = {
  transformers: {
    imageEmbeddingModel: "Xenova/clip-vit-base-patch32",
    imageEmbeddingDimension: 512, // CLIP ViT-B/32 embedding dimension
    textEmbeddingModel: "Xenova/all-MiniLM-L6-v2",
    textEmbeddingDimension: 384, // MiniLM sentence embedding dimension
    chatModel: "Xenova/Qwen1.5-1.8B-Chat",
  },
  lanceDb: {
    path: "./vectorDb",
  },
};

export const loadConfiguration = (): AppConfiguration => ({
  transformers: {
    imageEmbeddingModel:
      process.env.TRANSFORMERS_IMAGE_EMBEDDING_MODEL ??
      defaults.transformers.imageEmbeddingModel,
    imageEmbeddingDimension:
      parseInt(process.env.TRANSFORMERS_IMAGE_EMBEDDING_DIMENSION ?? "") ||
      defaults.transformers.imageEmbeddingDimension,
    textEmbeddingModel:
      process.env.TRANSFORMERS_TEXT_EMBEDDING_MODEL ??
      defaults.transformers.textEmbeddingModel,
    textEmbeddingDimension:
      parseInt(process.env.TRANSFORMERS_TEXT_EMBEDDING_DIMENSION ?? "") ||
      defaults.transformers.textEmbeddingDimension,
    chatModel:
      process.env.TRANSFORMERS_CHAT_MODEL ?? defaults.transformers.chatModel,
  },
  lanceDb: {
    path: process.env.LANCEDB_PATH ?? defaults.lanceDb.path,
  },
});

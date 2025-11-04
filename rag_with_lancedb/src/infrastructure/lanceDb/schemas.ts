import {
  Field,
  Float32,
  FixedSizeList,
  Schema,
  TimestampMillisecond,
  Utf8,
} from "apache-arrow";

export const IMAGE_TABLE_NAME = "images";
export const SENTENCE_TABLE_NAME = "sentences";
export const CHAT_TABLE_NAME = "chat";

const vectorField = (name: string, dim: number): Field =>
  new Field(
    name,
    new FixedSizeList(dim, new Field("item", new Float32(), true)),
    false
  );

export const createImageSchema = (embeddingDim: number): Schema =>
  new Schema([
    new Field("id", new Utf8(), false),
    new Field("createdAt", new TimestampMillisecond(), false),
    vectorField("rawEmbeddings", embeddingDim),
    vectorField("normalizedEmbeddings", embeddingDim),
    new Field("imageName", new Utf8(), false),
    new Field("imagePath", new Utf8(), false),
  ]);

export const createSentenceSchema = (embeddingDim: number): Schema =>
  new Schema([
    new Field("id", new Utf8(), false),
    new Field("createdAt", new TimestampMillisecond(), false),
    vectorField("rawEmbeddings", embeddingDim),
    vectorField("normalizedEmbeddings", embeddingDim),
    new Field("text", new Utf8(), false),
  ]);

export const createChatSchema = (embeddingDim: number): Schema =>
  new Schema([
    new Field("role", new Utf8(), false),
    new Field("message", new Utf8(), false),
    vectorField("rawEmbedding", embeddingDim),
    vectorField("normalizedEmbedding", embeddingDim),
  ]);

export interface ImageDocument extends Record<string, unknown> {
  id: string;
  createdAt: Date;
  rawEmbeddings: number[];
  normalizedEmbeddings: number[];
  imageName: string;
  imagePath: string;
}

export interface SentenceDocument extends Record<string, unknown> {
  id: string;
  createdAt: Date;
  rawEmbeddings: number[];
  normalizedEmbeddings: number[];
  text: string;
}

export interface ChatDocument extends Record<string, unknown> {
  role: string;
  message: string;
  rawEmbedding: number[];
  normalizedEmbedding: number[];
}

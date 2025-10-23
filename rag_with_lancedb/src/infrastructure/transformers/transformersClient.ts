import { inject, injectable } from "inversify";
import {
  pipeline as createPipeline,
  env as transformersEnv,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  AutoProcessor,
  CLIPVisionModelWithProjection,
} from "@xenova/transformers";
import type { AppConfiguration } from "../../application/configuration";
import { TYPES } from "../../application/tokens";

export type PipelineTask =
  | "feature-extraction"
  | "image-feature-extraction"
  | "text-generation"
  | string;

@injectable()
export class TransformersClient {
  private visionProcessor?: any;
  private visionModel?: any;
  private textEmbeddingPipeline?: unknown;
  private chatPipeline?: unknown;
  private clipTokenizer?: any;
  private clipTextModel?: any;
  constructor(
    @inject(TYPES.AppConfig) private readonly config: AppConfiguration
  ) {
    transformersEnv.allowLocalModels = true;
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.getVisionProcessor(),
      this.getVisionModel(),
      this.getTextEmbeddingPipeline(),
      this.getChatPipeline(),
      this.getClipTokenizer(),
      this.getClipTextModel(),
    ]);
  }

  async getVisionProcessor(): Promise<any> {
    if (!this.visionProcessor) {
      this.visionProcessor = await AutoProcessor.from_pretrained(
        this.config.transformers.imageEmbeddingModel
      );
    }
    return this.visionProcessor;
  }

  async getVisionModel(): Promise<any> {
    if (!this.visionModel) {
      this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(
        this.config.transformers.imageEmbeddingModel
      );
    }
    return this.visionModel;
  }

  async getTextEmbeddingPipeline(): Promise<any> {
    if (!this.textEmbeddingPipeline) {
      this.textEmbeddingPipeline = await createPipeline(
        "feature-extraction",
        this.config.transformers.textEmbeddingModel
      );
    }

    return this.textEmbeddingPipeline;
  }

  async getChatPipeline(): Promise<any> {
    if (!this.chatPipeline) {
      this.chatPipeline = await createPipeline(
        "text-generation",
        this.config.transformers.chatModel
      );
    }

    return this.chatPipeline;
  }

  async getClipTokenizer(): Promise<any> {
    if (!this.clipTokenizer) {
      this.clipTokenizer = await AutoTokenizer.from_pretrained(
        this.config.transformers.imageEmbeddingModel
      );
    }
    return this.clipTokenizer;
  }

  async getClipTextModel(): Promise<any> {
    if (!this.clipTextModel) {
      this.clipTextModel = await CLIPTextModelWithProjection.from_pretrained(
        this.config.transformers.imageEmbeddingModel
      );
    }
    return this.clipTextModel;
  }
}

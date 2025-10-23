import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { ImageRetrievalService } from "../../infrastructure/embeddings/imageRetrievalService";
import {
  ChatOptions,
  ChatService,
} from "../../infrastructure/chat/chatService";
import { ASSISTANT_CHAT_SYSTEM_PROMPT } from "./prompts";

@injectable()
export class AugmentedChatService {
  constructor(
    @inject(TYPES.ImageRetrievalService)
    private readonly imageRetrievalService: ImageRetrievalService,
    @inject(TYPES.ChatService)
    private readonly chatService: ChatService
  ) {}

  private ensureOneSentence(s: string): string {
    const cleaned = s
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^Assistant:\s*/i, "");

    const m = cleaned.match(/^(.+?[.!?])\s/);
    const first = m ? m[1] : cleaned.split(" ").slice(0, 20).join(" ");

    return /[.!?]$/.test(first ?? "") ? first ?? "" : `${first}.`;
  }

  async ask(prompt: string, options?: ChatOptions): Promise<string> {
    const images = await this.imageRetrievalService.retrieve(prompt, 1);

    const context: string[] = [];
    if (images.length) {
      context.push("<FAVORITES>");
      for (const item of images) {
        const base = item.imageName.replace(/\.[^.]+$/, "");
        const tokens = base
          .split(/[\-_\s]+/)
          .filter(Boolean)
          .map((t) => t.toLowerCase())
          .join(", ");
        context.push(
          `User favorite animals: ${item.imageName} (${item.imagePath}) | tags: ${tokens}`
        );
      }
      const combinedTokens = images
        .map((img) => img.imageName.replace(/\.[^.]+$/, ""))
        .join(" ")
        .toLowerCase();
      context.push(
        `Image preference hint: user seems interested in: ${combinedTokens}`
      );
      context.push("</FAVORITES>");
    }

    const mergedOptions: ChatOptions = {
      ...options,
      system: ASSISTANT_CHAT_SYSTEM_PROMPT,
      context: context.join("\n"),
    };

    const raw = await this.chatService.ask(
      `Answer in one short sentence: ${prompt}`,
      mergedOptions
    );

    return this.ensureOneSentence(raw);
  }
}

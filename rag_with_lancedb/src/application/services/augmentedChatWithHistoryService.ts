import { inject, injectable } from "inversify";
import { TYPES } from "../../application/tokens";
import { TextEmbeddingsService } from "../../infrastructure/embeddings/textEmbeddingsService";
import type { ChatMessageModel } from "../../domain/ChatMessageModel";
import {
  ChatOptions,
  ChatService,
} from "../../infrastructure/chat/chatService";
import { ChatLanceDbService } from "../../infrastructure/lanceDb/chatLanceDbService";
import { ChatHistoryRetrievalService } from "../../infrastructure/embeddings/chatHistoryRetrievalService";
import { ASSISTANT_CHAT_WITH_HISTORY_SYSTEM_PROMPT } from "./prompts";

@injectable()
export class AugmentedChatWithHistoryService {
  constructor(
    @inject(TYPES.ChatHistoryRetrievalService)
    private readonly chatHistoryRetrievalService: ChatHistoryRetrievalService,
    @inject(TYPES.ChatService)
    private readonly chatService: ChatService,
    @inject(TYPES.ChatLanceDbService)
    private readonly chatLanceDbService: ChatLanceDbService,
    @inject(TYPES.TextEmbeddingsService)
    private readonly textEmbeddingsService: TextEmbeddingsService
  ) {}

  async ask(prompt: string, options?: ChatOptions): Promise<string> {
    const chatHistory = await this.chatHistoryRetrievalService.retrieve(
      prompt,
      5
    );

    const context: string[] = [];
    if (chatHistory.length) {
      context.push("CHAT HISTORY:");
      for (const h of chatHistory) {
        context.push(`${h.role}: ${h.message}`);
      }
    }

    const mergedOptions: ChatOptions = {
      ...options,
      system: ASSISTANT_CHAT_WITH_HISTORY_SYSTEM_PROMPT,
      context: context.join("\n"),
      chatHistory: [
        ...(options?.chatHistory || []),
        ...chatHistory.map((m) => ({
          role: m.role,
          message: m.message,
        })),
      ],
    };
    const answer = await this.chatService.ask(prompt, mergedOptions);

    await this.persistConversation(answer);

    return answer;
  }

  private async persistConversation(answer: string) {
    const [answerEmbedding] = await Promise.all([
      this.textEmbeddingsService.textToEmbedding(answer),
    ]);

    const records: ChatMessageModel[] = [
      {
        role: "assistant",
        message: answer,
        embeddings: answerEmbedding,
      },
    ];

    await this.chatLanceDbService.saveMessages(records);
  }
}

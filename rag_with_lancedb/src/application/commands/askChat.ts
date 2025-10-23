import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { ChatService } from "../../infrastructure/chat/chatService";
import { ASSISTANT_CHAT_SYSTEM_PROMPT } from "../services/prompts";

@injectable()
export class AskChatCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.ChatService)
    private readonly chatService: ChatService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    const prompt = (await io.question("Ask your question: ")).trim();

    if (!prompt) {
      io.println("\nPrompt cannot be empty.");
      return;
    }

    const answer = await this.chatService.ask(prompt, {
      system: ASSISTANT_CHAT_SYSTEM_PROMPT,
    });
    io.println(`\nAssistant: ${answer}\n`);
  }
}

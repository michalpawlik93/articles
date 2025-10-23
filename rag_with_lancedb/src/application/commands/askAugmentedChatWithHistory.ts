import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { AugmentedChatWithHistoryService } from "../services/augmentedChatWithHistoryService";

@injectable()
export class AskAugmentedChatWithHistoryCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.AugmentedChatWithHistoryService)
    private readonly augmentedChatWithHistoryService: AugmentedChatWithHistoryService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    let chatHistory: { role: "user" | "assistant"; message: string }[] = [];
    let keepChatting = true;

    io.println("\nAugmented chat with history. Type 'exit' to finish.");

    while (keepChatting) {
      const prompt = (await io.question("You: ")).trim();
      if (!prompt || prompt.toLowerCase() === "exit") {
        keepChatting = false;
        break;
      }

      const answer = await this.augmentedChatWithHistoryService.ask(prompt, {
        chatHistory,
      });
      io.println(`\nAssistant: ${answer}\n`);
      chatHistory.push({ role: "user", message: prompt });
      chatHistory.push({ role: "assistant", message: answer });
    }
  }
}

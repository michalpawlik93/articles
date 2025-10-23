import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { AugmentedChatService } from "../services/augmentedChatService";

@injectable()
export class AskAugmentedChatCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.AugmentedChatService)
    private readonly augmentedChatService: AugmentedChatService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    const prompt = (
      await io.question("Ask your question (augmented): ")
    ).trim();

    if (!prompt) {
      io.println("\nPrompt cannot be empty.");
      return;
    }

    const answer = await this.augmentedChatService.ask(prompt);
    io.println(`\nAssistant: ${answer}\n`);
  }
}

import { inject, injectable } from "inversify";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { TYPES } from "./tokens";
import { SeedImagesCommand } from "./commands/seedImages";
import { SeedSentencesCommand } from "./commands/seedSentences";
import { FullTextSearchCommand } from "./commands/fullTextSearch";
import { FlatVectorSearchCommand } from "./commands/flatVectorSearch";
import { AskChatCommand } from "./commands/askChat";
import { AskAugmentedChatCommand } from "./commands/askAugmentedChat";
import { AskAugmentedChatWithHistoryCommand } from "./commands/askAugmentedChatWithHistory";
import { CreateIndicesCommand } from "./commands/createIndices";

export interface ConsoleIO {
  question(prompt: string): Promise<string>;
  println(message: string): void;
}

export interface ConsoleCommand {
  execute(io: ConsoleIO): Promise<void>;
}

@injectable()
export class ConsoleApp {
  constructor(
    @inject(TYPES.SeedImagesCommand)
    private readonly seedImagesCommand: SeedImagesCommand,
    @inject(TYPES.SeedSentencesCommand)
    private readonly seedSentencesCommand: SeedSentencesCommand,
    @inject(TYPES.FullTextSearchCommand)
    private readonly fullTextSearchCommand: FullTextSearchCommand,
    @inject(TYPES.FlatVectorSearchCommand)
    private readonly flatVectorSearchCommand: FlatVectorSearchCommand,
    @inject(TYPES.AskChatCommand)
    private readonly askChatCommand: AskChatCommand,
    @inject(TYPES.AskAugmentedChatCommand)
    private readonly askAugmentedChatCommand: AskAugmentedChatCommand,
    @inject(TYPES.AskAugmentedChatWithHistoryCommand)
    private readonly askAugmentedChatWithHistoryCommand: AskAugmentedChatWithHistoryCommand,
    @inject(TYPES.CreateIndicesCommand)
    private readonly createIndicesCommand: CreateIndicesCommand
  ) {}

  async run(): Promise<void> {
    const rl = createInterface({ input, output });
    const io: ConsoleIO = {
      question: (prompt: string) => rl.question(prompt),
      println: (message: string) => {
        output.write(`${message}\n`);
      },
    };

    io.println("Interactive LanceDB console ready.");

    let keepRunning = true;

    while (keepRunning) {
      io.println("Choose a mode:");
      io.println("1) seed images");
      io.println("2) seed sentences");
      io.println("3) fullTextSearch");
      io.println("4) flatVectorSearch");
      io.println("5) ask");
      io.println("6) augmentedAsk");
      io.println("7) augmentedAskWithHistory");
      io.println("8) createIndices");
      io.println("0) exit");

      const choice = (await io.question("> ")).trim();

      try {
        switch (choice) {
          case "1":
            await this.seedImagesCommand.execute(io);
            break;
          case "2":
            await this.seedSentencesCommand.execute(io);
            break;
          case "3":
            await this.fullTextSearchCommand.execute(io);
            break;
          case "4":
            await this.flatVectorSearchCommand.execute(io);
            break;
          case "5":
            await this.askChatCommand.execute(io);
            break;
          case "6":
            await this.askAugmentedChatCommand.execute(io);
            break;
          case "7":
            await this.askAugmentedChatWithHistoryCommand.execute(io);
            break;
          case "8":
            await this.createIndicesCommand.execute(io);
            break;
          case "0":
            keepRunning = false;
            break;
          default:
            io.println("Unsupported option. Try again.");
        }
      } catch (error) {
        io.println(
          `Command failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    rl.close();
    io.println("Goodbye!");
  }
}

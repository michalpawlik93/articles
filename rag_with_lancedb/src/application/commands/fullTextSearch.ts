import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { SentenceLanceDbService } from "../../infrastructure/lanceDb/sentenceLanceDbService";

@injectable()
export class FullTextSearchCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.SentenceLanceDbService)
    private readonly sentenceLanceDbService: SentenceLanceDbService
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    const query = (await io.question("Enter full-text query: ")).trim();

    if (!query) {
      io.println("\nQuery cannot be empty.");
      return;
    }
    const effectiveLimit = 5;

    const results = await this.sentenceLanceDbService.searchFullText(
      query,
      effectiveLimit
    );

    if (!results.length) {
      io.println("\nNo matching sentences found.");
      return;
    }

    io.println(`\nFound ${results.length} result(s):`);
    for (const result of results) {
      io.println(`- [${result.id}] ${result.text}`);
    }
    io.println("");
  }
}

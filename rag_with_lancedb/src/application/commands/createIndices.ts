import { inject, injectable } from "inversify";
import { ConsoleCommand, ConsoleIO } from "../console";
import { TYPES } from "../tokens";
import { LanceDbDataManager } from "../../infrastructure/lanceDb/lanceDbDataManager";

@injectable()
export class CreateIndicesCommand implements ConsoleCommand {
  constructor(
    @inject(TYPES.LanceDbDataManager)
    private readonly lanceDbDataManager: LanceDbDataManager
  ) {}

  async execute(io: ConsoleIO): Promise<void> {
    try {
      io.println("\nCreating indices...");
      await this.lanceDbDataManager.createIndexes();
      io.println("\nIndices created successfully!\n");
    } catch (error) {
      io.println(
        `\nFailed to create indices: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}

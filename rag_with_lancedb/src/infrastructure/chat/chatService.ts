import { inject, injectable } from "inversify";
import { TransformersClient } from "../transformers/transformersClient";
import { TYPES } from "../../application/tokens";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ChatOptions {
  system?: string;
  context?: string;
  chatHistory?: { role: "user" | "assistant"; message: string }[];
  maxNewTokens?: number;
  temperature?: number;
  topP?: number;
}

@injectable()
export class ChatService {
  constructor(
    @inject(TYPES.TransformersClient)
    private readonly transformersClient: TransformersClient
  ) {}

  async ask(prompt: string, options?: ChatOptions): Promise<string> {
    const generator = await this.transformersClient.getChatPipeline();

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: options?.system ?? "You are helpful assistant",
      },
    ];
    console.dir(`system: ${options?.system}`);

    if (options?.context) {
      console.dir(`context: ${options?.context}`);
      messages.push({
        role: "system",
        content: options.context,
      });
    }

    console.dir(`history: ${options?.chatHistory}`);
    for (const h of options?.chatHistory ?? []) {
      messages.push({ role: h.role, content: h.message });
    }

    console.dir(`prompt: ${prompt}`);
    messages.push({ role: "user", content: prompt });

    const text = generator.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
    });
    const output = await generator(text, {
      max_new_tokens: options?.maxNewTokens ?? 180,
      temperature: 0.0,
      top_p: 1.0,
      repetition_penalty: 1.05,
      do_sample: false,
      return_full_text: false,
    });

    const answer = output?.[0]?.generated_text?.trim() ?? "";

    if (!answer) {
      console.dir(output, { depth: null });
      throw Error("ChatService: Received empty answer from the model.");
    }

    return answer;
  }
}

import { Container } from "inversify";
import { loadConfiguration, AppConfiguration } from "./configuration";
import { TYPES } from "./tokens";
import { TransformersClient } from "../infrastructure/transformers/transformersClient";
import { LanceDbClient } from "../infrastructure/lanceDb/lanceDbClient";
import { LanceDbDataManager } from "../infrastructure/lanceDb/lanceDbDataManager";
import { ImageEmbeddingService } from "../infrastructure/embeddings/imageEmbeddingService";
import { TextEmbeddingsService } from "../infrastructure/embeddings/textEmbeddingsService";
import { ImageLanceDbService } from "../infrastructure/lanceDb/imageLanceDbService";
import { SentenceLanceDbService } from "../infrastructure/lanceDb/sentenceLanceDbService";
import { ChatLanceDbService } from "../infrastructure/lanceDb/chatLanceDbService";
import { ImageRetrievalService } from "../infrastructure/embeddings/imageRetrievalService";
import { SentenceRetrievalService } from "../infrastructure/embeddings/sentenceRetrievalService";
import { ChatHistoryRetrievalService } from "../infrastructure/embeddings/chatHistoryRetrievalService";
import { ConsoleApp } from "./console";
import { SeedImagesCommand } from "./commands/seedImages";
import { SeedSentencesCommand } from "./commands/seedSentences";
import { FullTextSearchCommand } from "./commands/fullTextSearch";
import { FlatVectorSearchCommand } from "./commands/flatVectorSearch";
import { CreateIndicesCommand } from "./commands/createIndices";
import { AskChatCommand } from "./commands/askChat";
import { AskAugmentedChatCommand } from "./commands/askAugmentedChat";
import { AskAugmentedChatWithHistoryCommand } from "./commands/askAugmentedChatWithHistory";
import { ChatService } from "../infrastructure/chat/chatService";
import { AugmentedChatService } from "./services/augmentedChatService";
import { AugmentedChatWithHistoryService } from "./services/augmentedChatWithHistoryService";

const bindCoreServices = (container: Container, config: AppConfiguration) => {
  container.bind<AppConfiguration>(TYPES.AppConfig).toConstantValue(config);

  container
    .bind<TransformersClient>(TYPES.TransformersClient)
    .to(TransformersClient)
    .inSingletonScope();

  container
    .bind<LanceDbClient>(TYPES.LanceDbClient)
    .to(LanceDbClient)
    .inSingletonScope();

  container
    .bind<LanceDbDataManager>(TYPES.LanceDbDataManager)
    .to(LanceDbDataManager)
    .inSingletonScope();

  container
    .bind<ImageEmbeddingService>(TYPES.ImageEmbeddingService)
    .to(ImageEmbeddingService)
    .inSingletonScope();

  container
    .bind<TextEmbeddingsService>(TYPES.TextEmbeddingsService)
    .to(TextEmbeddingsService)
    .inSingletonScope();

  container
    .bind<ImageLanceDbService>(TYPES.ImageLanceDbService)
    .to(ImageLanceDbService)
    .inSingletonScope();

  container
    .bind<SentenceLanceDbService>(TYPES.SentenceLanceDbService)
    .to(SentenceLanceDbService)
    .inSingletonScope();

  container
    .bind<ChatLanceDbService>(TYPES.ChatLanceDbService)
    .to(ChatLanceDbService)
    .inSingletonScope();

  container
    .bind<ImageRetrievalService>(TYPES.ImageRetrievalService)
    .to(ImageRetrievalService)
    .inSingletonScope();

  container
    .bind<SentenceRetrievalService>(TYPES.SentenceRetrievalService)
    .to(SentenceRetrievalService)
    .inSingletonScope();

  container
    .bind<ChatHistoryRetrievalService>(TYPES.ChatHistoryRetrievalService)
    .to(ChatHistoryRetrievalService)
    .inSingletonScope();

  container
    .bind<ChatService>(TYPES.ChatService)
    .to(ChatService)
    .inSingletonScope();

  container
    .bind<AugmentedChatService>(TYPES.AugmentedChatService)
    .to(AugmentedChatService)
    .inSingletonScope();

  container
    .bind<AugmentedChatWithHistoryService>(
      TYPES.AugmentedChatWithHistoryService
    )
    .to(AugmentedChatWithHistoryService)
    .inSingletonScope();
};

const bindConsole = (container: Container) => {
  container
    .bind<SeedImagesCommand>(TYPES.SeedImagesCommand)
    .to(SeedImagesCommand)
    .inSingletonScope();
  container
    .bind<SeedSentencesCommand>(TYPES.SeedSentencesCommand)
    .to(SeedSentencesCommand)
    .inSingletonScope();
  container
    .bind<FullTextSearchCommand>(TYPES.FullTextSearchCommand)
    .to(FullTextSearchCommand)
    .inSingletonScope();
  container
    .bind<FlatVectorSearchCommand>(TYPES.FlatVectorSearchCommand)
    .to(FlatVectorSearchCommand)
    .inSingletonScope();
  container
    .bind<CreateIndicesCommand>(TYPES.CreateIndicesCommand)
    .to(CreateIndicesCommand)
    .inSingletonScope();
  container
    .bind<AskChatCommand>(TYPES.AskChatCommand)
    .to(AskChatCommand)
    .inSingletonScope();
  container
    .bind<AskAugmentedChatCommand>(TYPES.AskAugmentedChatCommand)
    .to(AskAugmentedChatCommand)
    .inSingletonScope();
  container
    .bind<AskAugmentedChatWithHistoryCommand>(
      TYPES.AskAugmentedChatWithHistoryCommand
    )
    .to(AskAugmentedChatWithHistoryCommand)
    .inSingletonScope();

  container
    .bind<ConsoleApp>(TYPES.ConsoleApp)
    .to(ConsoleApp)
    .inSingletonScope();
};

export const createContainer = (): Container => {
  const container = new Container();
  const config = loadConfiguration();

  bindCoreServices(container, config);
  bindConsole(container);

  return container;
};

export const configureContainer = async (): Promise<Container> => {
  const container = createContainer();

  await container
    .get<TransformersClient>(TYPES.TransformersClient)
    .initialize();
  await container.get<LanceDbClient>(TYPES.LanceDbClient).connect();
  await container
    .get<LanceDbDataManager>(TYPES.LanceDbDataManager)
    .initializeTables();

  return container;
};

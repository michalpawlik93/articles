export const TYPES = {
  AppConfig: Symbol.for("AppConfig"),
  TransformersClient: Symbol.for("TransformersClient"),
  LanceDbClient: Symbol.for("LanceDbClient"),
  LanceDbDataManager: Symbol.for("LanceDbDataManager"),
  ImageEmbeddingService: Symbol.for("ImageEmbeddingService"),
  TextEmbeddingsService: Symbol.for("TextEmbeddingsService"),
  ImageLanceDbService: Symbol.for("ImageLanceDbService"),
  SentenceLanceDbService: Symbol.for("SentenceLanceDbService"),
  ChatLanceDbService: Symbol.for("ChatLanceDbService"),
  ImageRetrievalService: Symbol.for("ImageRetrievalService"),
  SentenceRetrievalService: Symbol.for("SentenceRetrievalService"),
  ChatHistoryRetrievalService: Symbol.for("ChatHistoryRetrievalService"),
  AugmentedChatService: Symbol.for("AugmentedChatService"),
  AugmentedChatWithHistoryService: Symbol.for(
    "AugmentedChatWithHistoryService"
  ),
  ConsoleApp: Symbol.for("ConsoleApp"),
  SeedImagesCommand: Symbol.for("SeedImagesCommand"),
  SeedSentencesCommand: Symbol.for("SeedSentencesCommand"),
  FullTextSearchCommand: Symbol.for("FullTextSearchCommand"),
  FlatVectorSearchCommand: Symbol.for("FlatVectorSearchCommand"),
  ChatService: Symbol.for("ChatService"),
  AskChatCommand: Symbol.for("AskChatCommand"),
  AskAugmentedChatCommand: Symbol.for("AskAugmentedChatCommand"),
  AskAugmentedChatWithHistoryCommand: Symbol.for(
    "AskAugmentedChatWithHistoryCommand"
  ),
  CreateIndicesCommand: Symbol.for("CreateIndicesCommand"),
} as const;

export type AppTypes = typeof TYPES;

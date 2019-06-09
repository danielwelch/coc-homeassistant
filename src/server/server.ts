import { createConnection, InitializeParams, InitializeResult, ProposedFeatures, ServerCapabilities, TextDocuments } from "vscode-languageserver";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { ConfigurationService } from "./configuration";
import { DefinitionProvider } from "./definition";
import { VsCodeFileAccessor } from "./fileAccessor";
import { HomeAssistantLanguageService } from "./haLanguageService";
import { HaConnection } from "./home-assistant/haConnection";
import { YamlIncludeDiscovery } from "./yamlIncludes/discovery";
import { YamlLanguageServiceWrapper } from "./yamlLanguageServiceWrapper";

 const connection = createConnection(ProposedFeatures.all);

// process.on('unhandledRejection', (e: any) => {
// 	console.error(formatError(`Unhandled exception`, e));
// });
// process.on('uncaughtException', (e: any) => {
// 	console.error(formatError(`Unhandled exception`, e));
// });

console.log = connection.console.log.bind(connection.console);
// console.error = connection.console.error.bind(connection.console);
console.warn = connection.window.showWarningMessage.bind(connection.window);
console.error = connection.window.showErrorMessage.bind(connection.window);

let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(async (params: InitializeParams): Promise<InitializeResult> => {

  connection.console.log(`[Server(${process.pid})] Started and initialize received`);

  var configurationService = new ConfigurationService();
  var haConnection = new HaConnection(configurationService);
  var fileAccessor = new VsCodeFileAccessor(params.rootUri, connection, documents);
  var yamlIncludeDiscovery = new YamlIncludeDiscovery(fileAccessor);
  var definitionProvider = new DefinitionProvider(fileAccessor);

  var yamlLanguageServiceWrapper = new YamlLanguageServiceWrapper([
    new EntityIdCompletionContribution(haConnection),
    new ServicesCompletionContribution(haConnection)
  ]);

  var homeAsisstantLanguageService = new HomeAssistantLanguageService(
    documents,
    yamlLanguageServiceWrapper,
    yamlIncludeDiscovery,
    haConnection,
    definitionProvider
  );

  await homeAsisstantLanguageService.triggerSchemaLoad(connection);

  documents.onDidChangeContent((e) => homeAsisstantLanguageService.onDocumentChange(e, connection));
  documents.onDidOpen((e) => homeAsisstantLanguageService.onDocumentOpen(e, connection));

  connection.onDocumentSymbol(homeAsisstantLanguageService.onDocumentSymbol);
  connection.onDocumentFormatting(homeAsisstantLanguageService.onDocumentFormatting);
  connection.onCompletion(homeAsisstantLanguageService.onCompletion);
  connection.onCompletionResolve(homeAsisstantLanguageService.onCompletionResolve);
  connection.onHover(homeAsisstantLanguageService.onHover);
  connection.onDefinition(homeAsisstantLanguageService.onDefinition);

  connection.onDidChangeConfiguration(async (config) => {
    configurationService.updateConfiguration(config);
    await haConnection.notifyConfigUpdate();

    if (!configurationService.isConfigured) {
      connection.sendNotification("no-config");
    }
  });

  return {
    capabilities: <ServerCapabilities>{
      textDocumentSync: documents.syncKind,
      completionProvider: { triggerCharacters: [" "], resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true,
      definitionProvider: true
    }
  };
});

connection.listen();

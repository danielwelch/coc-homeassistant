// import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions } from 'vscode-languageclient';
import { ExtensionContext, LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, workspace } from 'coc.nvim';
import * as path from 'path';


const documentSelector = [
    { language: 'home-assistant', scheme: 'file' },
    { language: 'home-assistant', scheme: 'untitled' }
    // { language: 'yaml', scheme: 'file' },
    // { language: 'yaml', scheme: 'untitled' } 
];

export function activate(context: ExtensionContext): Promise<void> {

    const config = workspace.getConfiguration().get<any>('homeassistant', {}) as any;
    if (!config.enable) {
        return;
    }

    const serverModule = path.join(context.extensionPath, 'lib', 'server', 'server.js');

    const debugOptions = { execArgv: ['--nolazy', "--inspect=6003"] };

    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
        options: {
            cwd: workspace.root
        }
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector,
        synchronize: {
            configurationSection: 'homeassistant',
            fileEvents: workspace.createFileSystemWatcher('**/*.yaml')
        },
        outputChannelName: 'homeassistant',

    };

    let client = new LanguageClient('home-assistant', 'Home Assistant Language Server', serverOptions, clientOptions);

    // is this really needed?
    // languages.setLanguageConfiguration('home-assistant', { wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/ });

    // context.subscriptions.push(reporter);
    context.subscriptions.push(client.start());

    client.onReady().then(async () => {
        console.log("Home Assistant extension activated and ready.")
        client.onNotification("no-config", async () => {
            console.error("ERROR: No configuration for coc-homeassistant. Please configure coc-homeassistant");
        });
    }).catch((reason) => {
        console.error(JSON.stringify(reason));
        // reporter.sendTelemetryEvent('extension.languageserver.onReadyError', { 'reason': JSON.stringify(reason) });
    });

    let fileAssociations = workspace.getConfiguration().get("files.associations");
    if (!fileAssociations) {
        workspace.getConfiguration().update("files.associations", { "*.yaml": "home-assistant" }, false);
    } else if (!fileAssociations["*.yaml"]) {
        workspace.getConfiguration().update("files.associations", { "*.yaml": "home-assistant" }, false);
    }
    
    return;
}

export function deactivate() {
    // reporter.dispose();
}

// function generateVersionString(extension: vscode.Extension<any>): string {
//     // if the extensionPath is a Git repo, this is probably an extension developer
//     const isDevMode: boolean = extension ? fs.existsSync(extension.extensionPath + '/.git') : false;
//     const baseVersion: string = extension ? extension.packageJSON.version : "0.0.0";

//     return isDevMode ? `${baseVersion}-dev` : baseVersion;
// }

// import * as fs from 'fs';
import * as path from 'path';
// import * as vscode from 'vscode';
// import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions } from 'vscode-languageclient';
import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions, ExtensionContext, workspace, languages } from 'coc.nvim';
// import TelemetryReporter from 'vscode-extension-telemetry';

// const myExtensionId = 'vscode-home-assistant';
// const telemetryVersion = generateVersionString(vscode.extensions.getExtension(`keesschollaart.${myExtensionId}`));

// let reporter: TelemetryReporter;

const documentSelector = [
    { language: 'home-assistant', scheme: 'file' },
    { language: 'home-assistant', scheme: 'untitled' }
];

export function activate(context: ExtensionContext) {
    console.log('Home Assistant Extension has been activated!');

    // reporter = new TelemetryReporter(myExtensionId, telemetryVersion, 'ff172110-5bb2-4041-9f31-e157f1efda56');
    // try {
    //     reporter.sendTelemetryEvent('extension.activate');
    // } catch (e) {
    //     // if something bad happens reporting telemetry, swallow it and move on
    //     console.log(`${e}`);
    // }

    let serverModule = path.join(context.extensionPath, 'lib', 'server', 'server.js');

    let debugOptions = { execArgv: ['--nolazy', "--inspect=6003"] };

    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector,
        synchronize: {
            configurationSection: 'homeassistant',
            fileEvents: workspace.createFileSystemWatcher('**/*.?(e)y?(a)ml')
        },
        outputChannelName: 'homeassistant',

    };

    let client = new LanguageClient('home-assistant', 'Home Assistant Language Server', serverOptions, clientOptions);

    // is this really needed?
    // languages.setLanguageConfiguration('home-assistant', { wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/ });

    // context.subscriptions.push(reporter);
    context.subscriptions.push(client.start());

    client.onReady().then(async () => {
        client.onNotification("no-config", async () => {
            console.error("ERROR: No configuration for coc-homeassistant. Please configure coc-homeassistant");
        });
    }).catch((reason) => {
        console.error(JSON.stringify(reason));
        // reporter.sendTelemetryEvent('extension.languageserver.onReadyError', { 'reason': JSON.stringify(reason) });
    });

    let fileAssociations = workspace.getConfiguration().get("files.associations");
    if (!fileAssociations["*.yaml"]) {
        workspace.getConfiguration().update("files.associations", { "*.yaml": "home-assistant" }, false);
    }
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

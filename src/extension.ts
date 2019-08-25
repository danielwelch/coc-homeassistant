import { ExtensionContext, LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, workspace } from 'coc.nvim';
import * as path from 'path';


const documentSelector = [
    { language: 'home-assistant', scheme: 'file' },
    { language: 'home-assistant', scheme: 'untitled' }
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

    context.subscriptions.push(client.start());

    client.onReady().then(async () => {
        console.log("Home Assistant extension activated and ready.");
        client.onNotification("no-config", async () => {
            console.error("ERROR: No configuration for coc-homeassistant. Please configure coc-homeassistant");
        });
    }).catch((reason) => {
        console.error(JSON.stringify(reason));
    });

    return;
}

export function deactivate() {
}


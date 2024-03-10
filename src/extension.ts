import * as vscode from 'vscode';
const YAML = require('yaml');
import * as path from 'path';
import * as fs from 'fs';
import { petition_openai } from './LLM/openai';

let messageContext: { user: string, assistant: string|any }[] = [];

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "myfirstextension" is now active!');

	let disposable = vscode.commands.registerCommand('myfirstextension.laia', () => {
		vscode.window.showInformationMessage('Hello VS Code');
	});

    const panel = vscode.window.createWebviewPanel(
        'chatInterface',
        'LAIA',
        vscode.ViewColumn.Two,
        {
            enableScripts: true
        }
    );

    const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'chat_window', 'chat.html'));

    fs.readFile(htmlPath.fsPath, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        panel.webview.html = data;
    });

    panel.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'openapi':
                vscode.window.showInformationMessage(message.text);
                petition_openai(messageContext, message.text)
                    .then(response => {
                        vscode.window.showInformationMessage(response || "");
                        panel.webview.postMessage({ command: 'openaiResponse', response });
                        messageContext.push({ user: message.text, assistant: response})
                        
                        if (response?.startsWith('###')) {
                            const yaml_doc = new YAML.Document();
                            yaml_doc.contents = JSON.parse(response.replace(/###/g, ''))
                            const directoryPath = vscode.workspace.rootPath;

                            const openapiFilePath = path.join(directoryPath ? directoryPath : '', 'openapi.yaml');
                            fs.access(openapiFilePath, fs.constants.F_OK, async (err) => {
                                if (err) {
                                    await writeFile(openapiFilePath, yaml_doc.toString());
                                } else {
                                    await writeFile(openapiFilePath, yaml_doc.toString());
                                }
                            });
                        }
                    });
                return;
          }
        },
        undefined,
        context.subscriptions
    );

	let onSaveCleaner = vscode.workspace.onDidSaveTextDocument((e) => {
		if (e.languageId == 'yaml' || e.fileName.endsWith('.yaml') || e.fileName.endsWith('.yml')){
			vscode.window.showInformationMessage('OpenAPI was updated!');

            vscode.window.showInputBox({ prompt: 'Regenerate project code? (yes/no)' }).then((input) => {
                if (input && input.toLowerCase() === 'yes') {
                    vscode.window.showInformationMessage('Re-generating project code...');

                    const directoryPath = path.dirname(e.uri.fsPath);

                    let terminal = vscode.window.activeTerminal || vscode.window.createTerminal();

                    if (process.platform === 'win32') {
                        terminal.sendText(`cd ${directoryPath}`);
                        terminal.sendText(`env\\Scripts\\activate`);
                        terminal.sendText(`python main.py`);
                    } else {
                        terminal.sendText(`cd ${directoryPath} && source venv/bin/activate && python main.py`);
                    }
                }
            });
		}
	});


	context.subscriptions.push(disposable);
	context.subscriptions.push(onSaveCleaner);
}

async function writeFile(filePath: string, text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, text, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function deactivate() {}

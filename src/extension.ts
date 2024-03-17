import * as vscode from 'vscode';
const YAML = require('yaml');
import * as path from 'path';
import * as fs from 'fs';
import { petition_openai } from './LLM/openai';
import { petition_ollama, petition_ollama_full } from './LLM/ollama';
import { chat_html } from './chat_window/chat';

let messageContext: { user: string, assistant: string|any }[] = [];
const logFilePathOpenai = path.join(vscode.workspace.rootPath || '', 'conversation_openai_log.txt');
const logFilePathSuperserver = path.join(vscode.workspace.rootPath || '', 'conversation_superserver_log.txt');

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "laiaextension" is now active!');

	let disposable = vscode.commands.registerCommand('laiaextension.laia', () => {
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

    panel.webview.html = chat_html;

    panel.webview.onDidReceiveMessage(
        message => {

            const directoryPath = vscode.workspace.rootPath;
            switch (message.command) {
                case 'openapi':
                    vscode.window.showInformationMessage(message.text);
                    petition_openai(messageContext, message.text)
                        .then(response => {
                            if (messageContext.length == 0) {
                                fs.appendFileSync(logFilePathOpenai, `CONVERSATION:\n`, 'utf-8');
                            }       
                            fs.appendFileSync(logFilePathOpenai, `User: ${message.text} Assistant: ${response?.trimStart()}\n`, 'utf-8');
                            messageContext.push({ user: message.text, assistant: response})
                            const startIndex = response?.indexOf('{');
                            if (startIndex !== -1) {
                                const endIndex = response?.lastIndexOf('}');
                                if (endIndex !== -1) {
                                    const jsonString = response?.substring(startIndex!, endIndex! + 1);
                                    try {
                                        const yaml_doc = new YAML.Document();
                                        yaml_doc.contents = JSON.parse(jsonString!);
               
                                        const directoryPath = vscode.workspace.rootPath;

                                        const openapiFilePath = path.join(directoryPath ? directoryPath : '', 'openapi.yaml');
                                        fs.access(openapiFilePath, fs.constants.F_OK, async (err) => {
                                            if (err) {
                                                await writeFile(openapiFilePath, yaml_doc.toString());
                                            } else {
                                                await writeFile(openapiFilePath, yaml_doc.toString());
                                            }
                                        });
                                    } catch (error: any) {
                                        panel.webview.postMessage({ command: 'errorOpenai', error: error.message });
                                    }
                                }
                            }
                            panel.webview.postMessage({ command: 'openaiResponse', response });
                        });
                    return;
                case 'ollama':
                    //petition_ollama('codellama', messageContext, message.text, panel)
                    petition_ollama_full('codellama', messageContext, message.text)
                    .then(response => {
                        if (messageContext.length == 0) {
                            fs.appendFileSync(logFilePathSuperserver, `CONVERSATION:\n`, 'utf-8');
                        }      
                        fs.appendFileSync(logFilePathSuperserver, `User: ${message.text} Assistant: ${response.trimStart()}\n`, 'utf-8');
                        messageContext.push({ user: message.text, assistant: response})
                        if (response?.startsWith('###')) {
                            try {
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
                            } catch (error: any) {
                                panel.webview.postMessage({ command: 'errorOpenai', error: error.message });
                            }
                        }
                        panel.webview.postMessage({ command: 'openaiResponse', response });
                    });
                    return;
                case 'python_code_gen':
                    vscode.window.showInformationMessage('Re-generating python code...');
                    if (process.platform === 'win32') {
                        //terminal.sendText(`cd ${directoryPath}`);
                        //terminal.sendText(`env\\Scripts\\activate`);
                        //terminal.sendText(`python main_backend.py`);
                        //terminal.sendText(`python main_frontend.py`);
                    } else {
                        let terminal1 = vscode.window.activeTerminal || vscode.window.createTerminal();
                        let terminal2 = vscode.window.createTerminal();
                        terminal1.sendText(`cd ${directoryPath} && source venv/bin/activate && python main_backend.py`);
                        terminal2.sendText(`cd ${directoryPath} && source venv/bin/activate && python main_frontend.py`);
                    }
                    return;
                case 'flutter_code_gen':
                    vscode.window.showInformationMessage('Re-generating flutter code...');
                    if (process.platform === 'win32') {
                        //terminal.sendText(`cd ${directoryPath}/frontend`);
                        //terminal.sendText(`flutter pub run build_runner build`);
                        //terminal.sendText(`flutter run -d chrome`);
                    } else {
                        let terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
                        terminal.sendText(`cd ${directoryPath}/frontend && flutter pub run build_runner build && flutter run -d chrome`);
                    }
                    return;
                case 'backend':
                    vscode.window.showInformationMessage('Activating Backend...');
                    if (process.platform === 'win32') {
                        //terminal.sendText(`cd ${directoryPath}/frontend`);
                        //terminal.sendText(`env\\Scripts\\activate`);
                        //terminal.sendText(`python main_backend.py`);
                    } else {
                        let terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
                        terminal.sendText(`cd ${directoryPath} && source venv/bin/activate && python main_backend.py`);
                    }
                    return;
                case 'frontend':
                    vscode.window.showInformationMessage('Re-generating flutter code...');
                    if (process.platform === 'win32') {
                        //terminal.sendText(`cd ${directoryPath}/frontend`);
                        //terminal.sendText(`flutter pub run build_runner build`);
                        //terminal.sendText(`flutter run -d chrome`);
                    } else {
                        let terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
                        terminal.sendText(`cd ${directoryPath}/frontend && flutter run -d chrome`);
                    }
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
                        terminal.sendText(`python main_backend.py`);
                        terminal.sendText(`python main_frontend.py`);
                    } else {
                        terminal.sendText(`cd ${directoryPath} && source venv/bin/activate && python main_backend.py && python main_frontend.py`);
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

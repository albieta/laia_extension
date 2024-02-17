import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "myfirstextension" is now active!');

	let disposable = vscode.commands.registerCommand('myfirstextension.helloWorld', () => {
		vscode.window.showInformationMessage('Hello VS Code');
	});

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
                        terminal.sendText(`cd ${directoryPath} && source env/bin/activate && python main.py`);
                    }
                }
            });
		}
	});


	context.subscriptions.push(disposable);
	context.subscriptions.push(onSaveCleaner);
}

export function deactivate() {}

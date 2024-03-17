import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
const YAML = require('yaml');
import { config_yaml, requirements_txt } from "./config";

export async function setup_files(directoryPath: string | undefined, panel: vscode.WebviewPanel) {
    if (!directoryPath) {
        vscode.window.showErrorMessage('No workspace opened.');
        return;
    }
    
    // Write config.yaml
    const configYamlPath = path.join(directoryPath, 'config.yaml');
    try {
        await fs.promises.access(configYamlPath, fs.constants.F_OK);
        vscode.window.showInformationMessage('config.yaml already exists.');
    } catch {
        try {
            await fs.promises.writeFile(configYamlPath, YAML.stringify(config_yaml));
            vscode.window.showInformationMessage('config.yaml created successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating config.yaml: ${error}`);
        }
    }

    // Write requirements.txt
    const requirementsTxtPath = path.join(directoryPath, 'requirements.txt');
    try {
        await fs.promises.access(requirementsTxtPath, fs.constants.F_OK);
        vscode.window.showInformationMessage('requirements.txt already exists.');
    } catch {
        try {
            await fs.promises.writeFile(requirementsTxtPath, requirements_txt);
            vscode.window.showInformationMessage('requirements.txt created successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating requirements.txt: ${error}`);
        }
    }
    // Write openapi.yaml
    const openapiYamlPath = path.join(directoryPath, 'openapi.yaml');
    try {
        await fs.promises.access(openapiYamlPath, fs.constants.F_OK);
        vscode.window.showInformationMessage('openapi.yaml already exists.');
    } catch {
        try {
            await fs.promises.writeFile(openapiYamlPath, '');
            vscode.window.showInformationMessage('openapi.yaml created successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating openapi.yaml: ${error}`);
        }
    }

    // Create Python env
    
    try {
        let terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        if (process.platform === 'win32') {
            terminal.sendText(`cd ${directoryPath}`);
            terminal.sendText(`python -m venv env`);
            terminal.sendText(`env\\Scripts\\activate`);
            terminal.sendText(`pip install -r requirements.txt`);
        } else {
            terminal.sendText(`cd ${directoryPath} && python3 -m venv env && source env/bin/activate && pip install -r requirements.txt`);
        }
        vscode.window.showInformationMessage('Python environment created successfully.');
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating Python environment: ${error}`);
    }
}
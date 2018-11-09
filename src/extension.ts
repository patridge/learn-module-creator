'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {
    window,
    commands,
    ExtensionContext,
} from 'vscode';
import FileController from "./file-controller";

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
    console.log("Module creator activated.");
    const extensionPath = context.extensionPath;
    
    commands.registerCommand(
        "extension.generateModule",
        async () => {
            const file = new FileController(extensionPath);

            try {
                // const root = await File.determineRoot();
                // const defaultFileName = await File.getDefaultFileValue(root);
                // const userFilePath = await File.showFileNameDialog(defaultFileName);
                const createdFiles = await file.createModuleScaffolding();
                await file.openFilesInEditor(createdFiles);
            } catch (err) {
                if (err && err.message) {
                    window.showErrorMessage(err.message);
                }
            }
        }
    );
}

import {
    TextEditor,
    window,
    workspace,
} from 'vscode';
import * as path from 'path'; // via Node.js
import * as fs from 'fs'; // via Node.js
import * as Handlebars from "handlebars"; // via npm:handlebars
import PromptsController from "./prompts-controller";
import LearnModuleModel from './learn-module-model';
import { denodeify } from 'q';

const appendFile = denodeify(fs.appendFile);
const fsStat = denodeify(fs.stat);
const fsReadFile = denodeify(fs.readFile);
const fsMkDir = denodeify(fs.mkdir);

// Possible option for recursive mkdir?
// import * as mkdirpImport from 'mkdirp'; // via npm:mkdirp
// const mkdirp = denodeify(mkdirpImport);

export default class FileController {
    constructor(readonly extensionPath: string) { }
    private async checkAndCreateModuleFolder(newModuleDirectoryPath: string): Promise<void> {
        const doesModuleDirectoryExist = await this.fsExists(newModuleDirectoryPath);
        if (doesModuleDirectoryExist) {
            // TODO: Append something until we can create it anyway.
            window.showErrorMessage(`Target module directory already exists: ${newModuleDirectoryPath}.`);
            return;
        }
        try {
            await this.fsCreateDirectory(newModuleDirectoryPath, true);
        } catch (error) {
            window.showErrorMessage(`Error creating target module directory: ${newModuleDirectoryPath} (error: ${error}).`);
            return;
        }
    }
    public async createModuleScaffolding(): Promise<string[]> {
        const prompts = new PromptsController();
        const promptResults = await prompts.promptForUserInputs();

        const workspaceFolderPath = await this.getDefaultCreationPath();
        const newModuleDirectoryPath = path.join(workspaceFolderPath, promptResults.moduleId || "new-module");
        await this.checkAndCreateModuleFolder(newModuleDirectoryPath);

        const templateDirectoryPath = await this.getTemplateFolder();
        const templateRelativeFilePaths = (await this.getTemplateFilePaths(templateDirectoryPath));
        let createdFilePaths: string[] = [];
        // Process templating on all files from the template.
        for (const templateRelativeFilePath of templateRelativeFilePaths) {
            console.log(templateRelativeFilePath);
            try {
                const createdFilePath = await this.scaffoldTemplateFile(templateDirectoryPath, templateRelativeFilePath, newModuleDirectoryPath, promptResults);
                createdFilePaths.push(createdFilePath);
            } catch (error) {
                // TODO: Decide what to handle here (error message, further logging, etc.)
            }
        }
        return createdFilePaths;
    }

    private async scaffoldTemplateFile(templateSourcePath: string, relativeTemplateFile: string, outputRootDestinationPath: string, templateValues: LearnModuleModel): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const sourceFilePath = path.join(templateSourcePath, relativeTemplateFile);
            const newFilePath = path.join(outputRootDestinationPath, relativeTemplateFile);
            const doesSourceFileExist: boolean = await this.fsExists(sourceFilePath);
            if (!doesSourceFileExist) {
                const errorMessage = `Template file "${sourceFilePath}" not found. Did not create output file "${newFilePath}".`;
                console.error(errorMessage);
                reject(errorMessage);
            }
            const doesOutputFileExist: boolean = await this.fsExists(newFilePath);
            if (doesOutputFileExist) {
                const errorMessage = `File "${newFilePath}" already exists. Did not overwrite existing file.`;
                console.warn(errorMessage);
                reject(errorMessage);
            }

            try {
                var templateFileContents = (await fsReadFile(
                    sourceFilePath,
                    'utf8'
                )) as string;
                const template = Handlebars.compile(templateFileContents);
                const content = template(templateValues);
                const newFileDirectoryPath = path.dirname(newFilePath);
                if (!await this.fsExists(newFileDirectoryPath)) {
                    await this.fsCreateDirectory(newFileDirectoryPath, true);
                }
                await appendFile(newFilePath, content);
                console.log(`Template file written\n${sourceFilePath} -> ${newFilePath}.`);
                resolve(newFilePath);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    private async getTemplateFolder(): Promise<string> {
        const templatePath = path.join(this.extensionPath, "/src/templates/learn-module");
        return templatePath;
    }
    private async getTemplateFilePaths(templateFolder: string): Promise<string[]> {
        // Recursive file finding adapted to TypeScript from a [Stack Overflow answer](https://stackoverflow.com/a/39118282/48700) by [alexcres](https://stackoverflow.com/users/6161335/alexcres).
        var walk = async function(dir: string, done: (err: any, results: string[]) => void) {
            var results: string[] = [];
            fs.readdir(dir, function(err, list) {
                if (err) { return done(err, []); }
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) { return done(null, results); }
                    file = dir + '/' + file;
                    fs.stat(file, function(err, stat) {
                        // TODO: Handle stat errors properly.
                        if (err) { next(); }
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                results = results.concat(res || []);
                                next();
                            });
                        } else {
                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        };
        // HACK: Rather than properly promise-ify the `walk` method above, I'm wrapping its call in a Promise for resolving/rejecting later.
        var walkResult = new Promise<string[]>((resolve, reject) => {
            walk(templateFolder, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results || []);
            });
        });
        // TODO: Handle any file errors.
        // Turn template-relative file paths into generic relative file paths for output use.
        return (await walkResult).map(filePath => {
            return "./" + path.relative(templateFolder, filePath);
        });
    }
    private async getRootWorkspaceFolder(): Promise<string | undefined> {
        // NOTE: Could be multiple workspaces open. Could be none open.
        if ((workspace.workspaceFolders!.length || 0) === 0) {
            console.error("No workspace open, and we need a starting directory.");
            return undefined;
        }
        if ((workspace.workspaceFolders!.length || 0) > 1) {
            // TODO: Handle multiple workspace folders, possibly via selection of destination.
            console.warn("Multiple workspaces open. Choosing first found.");
        }
        const workspaceFolderUri = workspace.workspaceFolders![0].uri;
        if (workspaceFolderUri.scheme !== 'file') {
            return undefined;
        }
        const workspaceFolderPath = workspaceFolderUri!.fsPath.toString() || undefined;
        return workspaceFolderPath;
    }
    private async getDefaultCreationPath(): Promise<string> {
        const workspaceFolderPath = await this.getRootWorkspaceFolder();
        // TODO: Verify platform happiness of the tilde fallback here, or if a helper is needed (a JS version of this Cake extension: https://github.com/patridge/Cake.PathTildeHelper).
        return workspaceFolderPath || "~";
    }

    private fsExists(path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.exists(path, exists => {
                resolve(exists);
            });
        });
    }
    private async fsCreateDirectory(path: string, recursive: boolean = false): Promise<void> {
        await fsMkDir(path, { recursive: recursive });
    }
    public openFilesInEditor(fileNames: string[]): Promise<TextEditor | undefined>[] {
        return fileNames.map(async fileName => {
            const stats = (await fsStat(fileName)) as fs.Stats;

            if (stats.isDirectory()) {
                window.showInformationMessage(
                'This file is actually a directory. Try a different name.'
                );
                return;
            }

            const textDocument = await workspace.openTextDocument(fileName);
            if (!textDocument) {
                throw new Error('Could not open file!');
            }

            const editor = window.showTextDocument(textDocument);
            if (!editor) {
                throw new Error('Could not show document!');
            }

            return editor;
        });
    }
}
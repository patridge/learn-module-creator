import {
    window,
} from 'vscode';
import * as validators from "./validators";
import StringHelpers from "./string-helpers";
import DateHelpers from "./date-helpers";
import LearnModuleModel from "./learn-module-model";

export default class PromptsController {
    private prompts = [
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleTitle = (await window.showInputBox({
                prompt: "What\'s the title for your module (with appropriate capitalization and spaces)?",
                validateInput: validators.validateNonEmpty,
                ignoreFocusOut: true,
            })) || ""; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
            promptResults.moduleId = StringHelpers.convertToLearnId(promptResults.moduleTitle);
        },
        async (promptResults: LearnModuleModel) => {
            const defaultValue = DateHelpers.getDateString(new Date());
            promptResults.modulePublishDate = (await window.showInputBox({
                prompt: "What\'s the publish date of this module (\"MM/dd/yyyy\")?",
                value: defaultValue,
                validateInput: validators.validatePublishDateString,
                ignoreFocusOut: true,
            })) || defaultValue; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
        },
        async (promptResults: LearnModuleModel) => {
            const defaultValue = "http://via.placeholder.com/120x120";
            promptResults.moduleBadgeIconUrl = (await window.showInputBox({
                prompt: "What\'s the URL of your module\'s badge icon?",
                value: defaultValue,
                ignoreFocusOut: true,
            })) || defaultValue; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
        },
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleAuthorGitHubId = (await window.showInputBox({
                prompt: "What\'s the GitHub username for the author?",
                ignoreFocusOut: true,
            })) || ""; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
        },
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleAuthorMicrosoftId = (await window.showInputBox({
                prompt: "What\'s the Microsoft username for the author?",
                ignoreFocusOut: true,
            })) || ""; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
            promptResults.moduleLearnContactMicrosoftId = (await window.showInputBox({
                prompt: "What\'s the Microsoft username for the Learn team maintainer?",
                value: promptResults.moduleAuthorMicrosoftId,
                ignoreFocusOut: true,
            })) || ""; // Shouldn't be empty after validator, but not sure how to let TypeScript know that.
        },
        async (promptResults: LearnModuleModel) => {
            // TODO: Determine if name is required or if it can be inferred from value.
            promptResults.moduleMsProdValue = (await window.showQuickPick(
                [
                    // TODO: Determine if name is required or if it can be inferred from value.
                    "learning-azure",
                    "learning-d365",
                    "learning-flow",
                    "learning-powerbi",
                    "learning-powerapps",
                ],
                {
                    canPickMany: false,
                    placeHolder: "Select a Microsoft Product value",
                    ignoreFocusOut: true,
                }
            )) || "";
        },
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleLevel = (await window.showQuickPick(
                [
                    "beginner",
                    "intermediate",
                    "advanced",
                ],
                {
                    canPickMany: false,
                    placeHolder: "Select a module level",
                    ignoreFocusOut: true,
                }
            )) || "";
        },
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleFirstRole = (await window.showQuickPick(
                [
                    // TODO: Pull from an up-to-date list directly.
                    "developer",
                    "administrator",
                    "solution architect",
                    "business user",
                    "business analyst",
                ],
                {
                    canPickMany: false,
                    placeHolder: "Select a first module role (others added manually)",
                    ignoreFocusOut: true,
                }
            )) || "";
        },
        async (promptResults: LearnModuleModel) => {
            promptResults.moduleFirstProduct = (await window.showQuickPick(
                [
                    // TODO: Pull from an up-to-date list directly.
                    "azure",
                    "bizapps",
                    "vs",
                ],
                {
                    canPickMany: false,
                    placeHolder: "Select first module product (others added manually)",
                    ignoreFocusOut: true,
                }
            )) || "";
            promptResults.moduleSecondProduct = (await window.showQuickPick(
                [
                    // Pulled from https://review.docs.microsoft.com/en-us/new-hope/information-architecture/metadata/taxonomies?branch=master#learn-product
                    // Via jQuery call: `$("#learn-product").next().find("tr").filter(function (i, e) { return $(e).find("td:last").text() === "2"; }).find("td:first").map(function () { return "{\n\tvalue: \"" + $(this).text() + "\"\n},\n"; }).get().join("")`
                    // Then, filtered by prefix of first product.
                    // FUTURE: Pull from an up-to-date list directly.
                    "azure-active-directory",
                    "azure-advisor",
                    "azure-application-insights",
                    "azure-cdn",
                    "azure-clis",
                    "azure-cloud-shell",
                    "azure-container-instances",
                    "azure-container-registry",
                    "azure-cosmos-db",
                    "azure-cost-management",
                    "azure-event-grid",
                    "azure-event-hubs",
                    "azure-functions",
                    "azure-key-vault",
                    "azure-log-analytics",
                    "azure-monitor",
                    "azure-portal",
                    "azure-redis-cache",
                    "azure-resource-manager",
                    "azure-sdks",
                    "azure-service-bus",
                    "azure-sql-database",
                    "azure-storage",
                    "azure-virtual-machines",
                    "bizapps-d365",
                    "bizapps-flow",
                    "bizapps-power-apps",
                    "bizapps-power-bi",
                    "vs-code",
                ].filter(function(product) { 
                    return !promptResults.moduleFirstProduct || product.startsWith(promptResults.moduleFirstProduct + "-");
                }),
                {
                    canPickMany: false,
                    placeHolder: "Select second module product (others added manually)",
                    ignoreFocusOut: true,
                }
            )) || "";
        },
    ];

    public async promptForUserInputs(): Promise<LearnModuleModel> {
        const promptResults = new LearnModuleModel();
        // TODO: Allow Esc and clicking elsewhere to cancel instead of submitting.
        for (let prompt of this.prompts) {
            await prompt(promptResults);
        }
        return promptResults;
    }
}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { compileAndRunCurrentFile } from "./code-runner";
import { formatCurrentFile } from "./code-formatter";
import { provideCompletionItems } from "./autocomplete";

let outputChannel: vscode.OutputChannel;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const registerCommands = () => {
  let compileAndRunCurrentFileDisposable = vscode.commands.registerCommand(
    "flow-wing-compile-and-run",
    () => {
      compileAndRunCurrentFile(outputChannel);
    }
  );

  const formatFlowWingDisposable = vscode.commands.registerCommand(
    "flow-wing.format",
    () => {
      formatCurrentFile(outputChannel);
    }
  );

  return [compileAndRunCurrentFileDisposable, formatFlowWingDisposable];
};

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "Flow-Wing Code Runner" is now active!'
  );
  //outputChannel.appendLine('Compilation Started.');
  outputChannel = vscode.window.createOutputChannel("flowwing");
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  const registerOnDidSaveTextDocumentDisposable =
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      // Check if the saved document is of the desired language
      if (document.languageId === "flowwing") {
        // Call the function to format the current file
        formatCurrentFile(outputChannel);
      }
    });

  const registerOnDidChangeTextDocumentDisposable =
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const position = editor.selection.active;
      const closingChars: Record<string, string> = {
        "(": ")",
        "{": "}",
        "[": "]",
      };
      // Check if the character typed is an opening character
      if (event.contentChanges.length > 0) {
        // Insert the corresponding closing character
        const typedCharacter = event.contentChanges[0].text;
        if (typedCharacter in closingChars) {
          const nextPosition = position.translate(0, 1);

          editor.edit((editBuilder) => {
            editBuilder.insert(nextPosition, closingChars[typedCharacter]);
          });
        }
      }
    });

  const registerCompletionItemProviderDisposable =
    vscode.languages.registerCompletionItemProvider("flowwing", {
      provideCompletionItems: provideCompletionItems,
    });

  context.subscriptions.push(
    registerCompletionItemProviderDisposable,
    registerOnDidSaveTextDocumentDisposable,
    registerOnDidChangeTextDocumentDisposable,
    ...registerCommands()
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

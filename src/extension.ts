// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { compileCurrentFile } from './compiler';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  //const outputChannel = vscode.window.createOutputChannel('Elang');

  console.log(
    'Congratulations, your extension "elang-compiler" is now active!'
  );

  //outputChannel.appendLine('Compilation Started.');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'elang-compiler.compile',
    () => {
      compileCurrentFile();
    }
  );

  context.subscriptions.push(disposable);
  //   const compileButton = vscode.window.createStatusBarItem(
  //     vscode.StatusBarAlignment.Left
  //   );
  //   compileButton.text = '$(triangle-right) Compile';
  //   compileButton.command = 'elang-compiler.compile';
  //   compileButton.show();
}

// This method is called when your extension is deactivated
export function deactivate() {}

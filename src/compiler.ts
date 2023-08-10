import * as vscode from 'vscode';
import * as childProcess from 'child_process';

let terminal: vscode.Terminal | undefined;
let diagnosticCollection: vscode.DiagnosticCollection =
  vscode.languages.createDiagnosticCollection('Elang');

export function compileCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const filePath = editor.document.uri.fsPath; // Get the full file path

    // Replace 'ElangCompilerPath' with the actual path to your ElangCompiler executable
    const elangCompilerPath =
      'E:/projects-2023/elang/all-targets/compiler/build/Release/ElangCompiler.exe';

    const command = `${elangCompilerPath} ${filePath}`;

    // If the terminal doesn't exist, create one
    if (!terminal) {
      terminal = vscode.window.createTerminal('Elang');
    }

    // Send the compilation command to the terminal
    terminal.sendText(command);
    terminal.show();
    // Clear existing diagnostics for this file

    diagnosticCollection.delete(editor.document.uri);

    // Create a diagnostic collection for this file
    diagnosticCollection = vscode.languages.createDiagnosticCollection('Elang');

    // Listen for terminal output and parse it for errors
    terminal.processId.then((pid) => {
      const childProc = childProcess.spawn('cmd.exe', ['/c', command], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';

      childProc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProc.on('close', (code) => {
        // Parse stderr to extract error messages, line numbers, and column numbers
        const regex = /line (\d+):(\d+)\s(.*)/g;
        let match;
        const diagnostics = [];
        while ((match = regex.exec(stderr)) !== null) {
          const lineNumber = parseInt(match[1]) - 1; // Convert to 0-based index
          const columnNumber = parseInt(match[2]) - 1; // Convert to 0-based index
          const errorMessage = match[3];
          const range = new vscode.Range(
            lineNumber,
            columnNumber,
            lineNumber,
            Number.MAX_VALUE
          );
          const diagnostic = new vscode.Diagnostic(
            range,
            errorMessage,
            vscode.DiagnosticSeverity.Error
          );

          diagnostics.push(diagnostic);
        }
        if (diagnostics.length > 0) {
          vscode.window.showErrorMessage('Compilation failed.');
          diagnosticCollection.set(editor.document.uri, diagnostics);
        } else {
          vscode.window.showInformationMessage('Compilation successful.');
        }
      });
    });
  }
}

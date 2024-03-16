import * as vscode from "vscode";
import * as childProcess from "child_process";
import * as path from "path";
import { flowWingExists } from "./utils";

const diagnosticCollection = vscode.languages.createDiagnosticCollection(
  "flowWingDiagnosticCollection"
);

let terminal: vscode.Terminal | undefined;

let filePaths: string[] = [];

export function compileAndRunCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const filePath = editor.document.uri.fsPath; // Get the full file path

    if (!filePath) {
      return;
    }

    if (!filePath.endsWith(".fg")) {
      vscode.window.showErrorMessage(
        "Please save your file with a .fg extension."
      );
      return;
    }

    const fileNameWithExtension = path.basename(filePath);
    const extension = path.extname(filePath);
    const fileNameWithoutExtension = path.basename(filePath, extension);
    const directoryName = path.dirname(filePath);
    try {
      flowWingExists(); // Check if FlowWing exists
    } catch (error) {
      vscode.window.showErrorMessage(
        "FlowWing executable not found.\n\n" +
          "To compile and run your code with FlowWing, you need to download it from the following link:\n\n" +
          "[FlowWing GitHub Releases](https://github.com/kushagra1212/Flow-Wing/releases/tag/v0.0.1-alpha)"
      );

      return;
    }

    // Replace 'FlowWingCompilerPath' with the actual path to your FlowWingCompiler executable

    const command = `cd ${directoryName} && flowwing ${fileNameWithExtension}`;

    vscode.window.onDidCloseTerminal((_terminal) => {
      if (_terminal.processId === terminal?.processId) {
        terminal = undefined;
      }
    });

    // If the terminal doesn't exist, create one
    if (!terminal) {
      terminal = vscode.window.createTerminal("FlowWing");
    }

    const childProc = childProcess.exec(command, (error, stdout, stderr) => {
      const diagnostics = [];
      const output = stdout || stderr;
      console.log("error:", error);
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);

      clearDiagnostics();
      if (output && !output.includes("LLVM") && stdout !== "\n") {
        const colorRegex = /\x1b\[[0-9;]*m/g;

        // Remove all colors from the stdout
        const stdoutWithoutColors = output.replace(colorRegex, "");
        const regex = /Line (\d+):(\d+)\s(.*)/g;
        const ans = regex.exec(stdoutWithoutColors);

        if (ans?.length !== 4) {
          return;
        }

        const lineNumber = parseInt(ans[1]) - 1; // Convert to 0-based index
        const columnNumber = parseInt(ans[2]) - 1; // Convert to 0-based index
        const errorMessage = ans[3];
        const locationRegex = /(Location:)\s(.*)/g;
        const location = locationRegex.exec(stdoutWithoutColors);

        if (location?.length !== 3) {
          return;
        }

        const fileLocation = location[2];
        openFile(fileLocation);

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
        vscode.window.showErrorMessage("FlowWing error: Failed to compile");
        addDiagnostics(fileLocation, [diagnostic]);
      } else {
        const runCMD = `./${fileNameWithoutExtension}`;
        terminal?.sendText(runCMD);
        terminal?.show();
      }
    });
  }
}

async function openFile(filePath: string): Promise<void> {
  try {
    // Convert the file path to URI
    const uri: vscode.Uri = vscode.Uri.file(filePath);

    // Open the document
    const document: vscode.TextDocument =
      await vscode.workspace.openTextDocument(uri);

    // Show the document in the editor
    await vscode.window.showTextDocument(document);
  } catch (error) {
    // Handle errors if any
    console.error("Error occurred while opening file:", error);
  }
}
function addDiagnostics(filePath: string, diagnostics: vscode.Diagnostic[]) {
  // Convert the file path to URI
  const uri: vscode.Uri = vscode.Uri.file(filePath);

  diagnosticCollection.delete(uri);

  diagnosticCollection.set(uri, diagnostics);
  filePaths.push(filePath);
}

function clearDiagnostics() {
  for (const paths of filePaths) {
    const uri: vscode.Uri = vscode.Uri.file(paths);
    diagnosticCollection.delete(uri);
  }
}

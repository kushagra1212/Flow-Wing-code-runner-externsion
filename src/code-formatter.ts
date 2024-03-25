import * as vscode from "vscode";
import * as childProcess from "child_process";
import {
  FLOW_WING_PATH,
  getFileDetails,
  openFile,
  parseErrorAndExtractLocation,
} from "./utils";
import DiagnosticHandler from "./diagnostics/DiagnosticHandler";
import TerminalHandler from "./terminal/TerminalHandler";

const diagnosticHandler = new DiagnosticHandler();

function formatDocument(outputChannel: vscode.OutputChannel): Promise<string> {
  return new Promise((resolve, reject) => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      reject("");
      return;
    }

    const { directoryName, fileNameWithExtension } = getFileDetails();

    if (!fileNameWithExtension || !directoryName) {
      reject("");
      return;
    }

    const command = `cd ${directoryName} && ${FLOW_WING_PATH} --file=${fileNameWithExtension} --format`;

    childProcess.exec(command, (error, stdout, stderr) => {
      // console.log("error:", error);
      // console.log("stdout:", stdout);
      // console.log("stderr:", stderr);

      diagnosticHandler.clearDiagnostics();
      outputChannel.clear();
      if (stderr) {
        TerminalHandler.initializeTerminal();
        outputChannel.show();
        const {
          stdoutWithoutColors,
          lineNumber,
          columnNumber,
          errorMessage,
          location,
        } = parseErrorAndExtractLocation(stderr);

        outputChannel.appendLine(stdoutWithoutColors);
        if (location?.length !== 3) {
          reject("FlowWing formatting error");
          return;
        }

        const filePath = location[2];
        openFile(filePath);

        diagnosticHandler.addDiagnostics({
          lineNumber,
          columnNumber,
          errorMessage,
          filePath,
        });
        vscode.window.showWarningMessage("FlowWing formatting error");
        reject("FlowWing formatting error");
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function formatCurrentFile(outputChannel: vscode.OutputChannel) {
  const { activeTextEditor } = vscode.window;

  if (activeTextEditor) {
    const { document, selection } = activeTextEditor;

    try {
      // Get current cursor position

      const formattedText = await formatDocument(outputChannel);

      if (formattedText) {
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );

        const edit = new vscode.TextEdit(fullRange, formattedText);
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.set(document.uri, [edit]);

        await vscode.workspace.applyEdit(workspaceEdit);

        await document.save();
      }
    } catch (error) {
      if (error)
        vscode.window.showErrorMessage(`Error formatting document: ${error}`);
    }
  }
}

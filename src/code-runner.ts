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

export function compileAndRunCurrentFile(outputChannel: vscode.OutputChannel) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  TerminalHandler.initializeTerminal();

  const { directoryName, fileNameWithExtension, fileNameWithoutExtension } =
    getFileDetails();

  const command = `cd ${directoryName} && ${FLOW_WING_PATH} --file=${fileNameWithExtension}`;

  childProcess.exec(command, (error, stdout, stderr) => {
    const output = stdout || stderr;
    // console.log("error:", error);
    // console.log("stdout:", stdout);
    // console.log("stderr:", stderr);

    diagnosticHandler.clearDiagnostics();
    TerminalHandler.initializeTerminal();
    if (stderr) {
      outputChannel.clear();
      outputChannel.show();
      const {
        stdoutWithoutColors,
        lineNumber,
        columnNumber,
        errorMessage,
        location,
      } = parseErrorAndExtractLocation(output);

      outputChannel.appendLine(stdoutWithoutColors);
      if (location?.length !== 3) {
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
      vscode.window.showErrorMessage("FlowWing error: Failed to compile");
    } else {
      const runCMD = `build/bin/${fileNameWithoutExtension}`;
      TerminalHandler.getTerminal()?.sendText(runCMD);
      TerminalHandler.getTerminal()?.show();
    }
  });
}

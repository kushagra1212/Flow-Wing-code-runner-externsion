import * as childProcess from "child_process";
import * as vscode from "vscode";
import * as path from "path";

export const FLOW_WING_PATH = "flowwing";
export function flowWingExists(): void {
  const command =
    process.platform === "win32" ? "where FlowWing" : "which FlowWing";

  try {
    // Execute the command to check if FlowWing exists
    childProcess.execSync(command);
  } catch (err) {
    throw new Error("FlowWing executable not found on the system.");
  }
}

type FileDetails = {
  filePath: string;
  fileNameWithExtension: string;
  extension: string;
  fileNameWithoutExtension: string;
  directoryName: string;
};

export const getFileDetails = (): FileDetails => {
  const editor = vscode.window.activeTextEditor;
  let fileDetails: FileDetails = {
    filePath: "",
    fileNameWithExtension: "",
    extension: "",
    fileNameWithoutExtension: "",
    directoryName: "",
  };

  if (!editor) {
    return fileDetails;
  }

  const filePath = editor.document.uri.fsPath;
  if (!filePath) {
    return fileDetails;
  }

  if (!filePath.endsWith(".fg")) {
    // vscode.window.showErrorMessage(
    //   "Please save your file with a .fg extension."
    // );
    return fileDetails;
  }

  fileDetails.fileNameWithExtension = path.basename(filePath);
  fileDetails.extension = path.extname(filePath);
  fileDetails.fileNameWithoutExtension = path.basename(
    filePath,
    fileDetails.extension
  );
  fileDetails.directoryName = path.dirname(filePath);
  try {
    flowWingExists(); // Check if FlowWing exists
  } catch (error) {
    vscode.window.showErrorMessage(
      "FlowWing executable not found.\n\n" +
        "To compile and run your code with FlowWing, you need to download it from the following link:\n\n" +
        "[FlowWing GitHub Releases](https://github.com/kushagra1212/Flow-Wing/releases/tag/v0.0.1-alpha)"
    );
  } finally {
    return fileDetails;
  }
};

export async function openFile(filePath: string): Promise<void> {
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

type LocationResult = {
  lineNumber: number;
  columnNumber: number;
  errorMessage: string;
  stdoutWithoutColors: string;
  location: RegExpExecArray | null;
};

export const parseErrorAndExtractLocation = (error: string): LocationResult => {
  const locationResult: LocationResult = {
    lineNumber: 0,
    columnNumber: 0,
    errorMessage: "",
    stdoutWithoutColors: "",
    location: null,
  };

  const colorRegex = /\x1b\[[0-9;]*m/g;

  // Remove all colors from the stdout
  locationResult.stdoutWithoutColors = error.replace(colorRegex, "");
  const regex = /Line (\d+):(\d+)\s(.*)/g;
  const ans = regex.exec(locationResult.stdoutWithoutColors);

  if (ans?.length !== 4) {
    return locationResult;
  }

  locationResult.lineNumber = parseInt(ans[1]) - 1; // Convert to 0-based index
  locationResult.columnNumber = parseInt(ans[2]) - 1; // Convert to 0-based index
  locationResult.errorMessage = ans[3];
  const locationRegex = /(Location:)\s(.*)/g;
  locationResult.location = locationRegex.exec(
    locationResult.stdoutWithoutColors
  );

  return locationResult;
};

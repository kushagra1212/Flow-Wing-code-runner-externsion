import * as vscode from "vscode";

export default class DiagnosticHandler {
  private filePaths: string[];
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.filePaths = [];
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
      "flowWingDiagnosticCollection"
    );
  }

  public addDiagnostics({
    filePath,
    lineNumber,
    columnNumber,
    errorMessage,
  }: {
    filePath: string;
    lineNumber: number;
    columnNumber: number;
    errorMessage: string;
  }): void {
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

    // Convert the file path to URI
    const uri: vscode.Uri = vscode.Uri.file(filePath);

    this.diagnosticCollection.delete(uri);

    this.diagnosticCollection.set(uri, [diagnostic]);
    this.filePaths.push(filePath);
  }

  public clearDiagnostics(): void {
    for (const filePath of this.filePaths) {
      const uri: vscode.Uri = vscode.Uri.file(filePath);
      this.diagnosticCollection.delete(uri);
    }
  }
}

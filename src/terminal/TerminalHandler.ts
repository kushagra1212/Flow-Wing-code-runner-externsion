import * as vscode from "vscode";

export default class TerminalHandler {
  private static terminal: vscode.Terminal | undefined;

  public static initializeTerminal() {
    vscode.window.onDidCloseTerminal((_terminal) => {
      if (_terminal.processId === TerminalHandler.terminal?.processId) {
        TerminalHandler.terminal = undefined;
      }
    });

    // If the terminal doesn't exist, create one
    if (!TerminalHandler.terminal) {
      TerminalHandler.terminal = vscode.window.createTerminal("FlowWing");
    }
  }

  public static getTerminal(): vscode.Terminal | undefined {
    return TerminalHandler.terminal;
  }
}

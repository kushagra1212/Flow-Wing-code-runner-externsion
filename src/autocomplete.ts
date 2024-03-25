import * as vscode from "vscode";

export function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken,
  context: vscode.CompletionContext
) {
  const completionItems: vscode.CompletionItem[] = [];
  const text = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );

  // Regular expression to match keywords
  const keywordRegex = /\b(var|const|fun|type)\b/g;
  let match;
  while ((match = keywordRegex.exec(text)) !== null) {
    const keyword = match[1];
    const completionItem = new vscode.CompletionItem(
      keyword,
      vscode.CompletionItemKind.Keyword
    );
    completionItems.push(completionItem);
  }

  // Regular expression to match variables and constants
  const variableRegex = /\b(var|const)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  while ((match = variableRegex.exec(text)) !== null) {
    const variableName = match[2];
    const completionItem = new vscode.CompletionItem(
      variableName,
      vscode.CompletionItemKind.Variable
    );
    completionItems.push(completionItem);
  }

  // Regular expression to match function names
  const functionRegex = /\b(fun)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  while ((match = functionRegex.exec(text)) !== null) {
    const functionName = match[2];
    const completionItem = new vscode.CompletionItem(
      functionName,
      vscode.CompletionItemKind.Function
    );
    completionItems.push(completionItem);
  }

  // Regular expression to match type names
  const typeRegex = /\b(type)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  while ((match = typeRegex.exec(text)) !== null) {
    const typeName = match[2];
    const completionItem = new vscode.CompletionItem(
      typeName,
      vscode.CompletionItemKind.Class
    );
    completionItems.push(completionItem);
  }

  return completionItems;
}

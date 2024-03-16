import * as childProcess from "child_process";

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

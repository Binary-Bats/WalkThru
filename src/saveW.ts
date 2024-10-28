import { join } from "path";
import * as fs from "fs";
import * as vscode from "vscode";

// Interface for tour step data
interface TourStep {
  file: string;
  line: number;
  description: string;
}

// Interface for the complete tour data
interface TourData {
  title: string;
  steps: TourStep[];
}

// Interface for tour info stored in index
interface TourInfo {
  title: string;
  numSteps: number;
}

export const saveTour = (
  context: vscode.ExtensionContext,
  data: TourData
): void => {
  const projectName: string | undefined = vscode.workspace.name;
  const tourName: string = data.title.replace(/\s+/g, "-").toLowerCase(); // Convert tour name to lowercase and replace spaces with hyphens
  const tourFileName: string = `${tourName}.json`;

  // Using non-null assertion operator since we know workspace.rootPath exists in this context
  const toursDir: string = join(vscode.workspace.rootPath!, ".WalkThru");

  if (!fs.existsSync(toursDir)) {
    fs.mkdirSync(toursDir);
  }

  const filePath: string = join(toursDir, tourFileName);
  const indexPath: string = join(toursDir, "index.json");

  const tourInfo: TourInfo = {
    title: tourName,
    numSteps: data.steps.length,
  };

  saveTourData(filePath, data);
};

// Function to save tour data to a file
function saveTourData(filePath: string, data: TourData): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    vscode.window.showInformationMessage(`Tour data saved to ${filePath}`);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Error saving tour data: ${error.message}`
      );
    } else {
      vscode.window.showErrorMessage(
        "An unknown error occurred while saving tour data"
      );
    }
  }
}

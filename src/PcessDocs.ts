import fs from "fs";
import { verifyPath, verifySnippet } from "./utils";

interface Block {
  id: string;
  outdated: boolean;
  obsolete: boolean;
  type: string;
  data: {
    path: string;
    line_start?: number;
    line_end?: number;
    text?: string;
    label?: string;
    contextValue?: string;
  };
}

interface WalkThruDoc {
  id: string;
  title: string;
  blocks: Block[];
  updated: string;
  created: string;
}

export async function processJson(
  jsonInput: string | WalkThruDoc
): Promise<WalkThruDoc> {
  try {
    // Parse the input if it's a string
    let jsonData: WalkThruDoc;
    if (typeof jsonInput === "string") {
      try {
        jsonData = JSON.parse(jsonInput);
      } catch (parseError) {
        console.error("Error parsing JSON input:", parseError);
        throw new Error("Invalid JSON input");
      }
    } else {
      jsonData = jsonInput;
    }

    // Validate the JSON structure
    if (!jsonData || !Array.isArray(jsonData.blocks)) {
      throw new Error(
        "Invalid JSON structure: missing or invalid blocks array"
      );
    }

    // Deep clone the input to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(jsonData));

    // Process each block
    for (let i = 0; i < processedData.blocks.length; i++) {
      const block = processedData.blocks[i];

      if (!block || typeof block !== "object") {
        console.warn(`Skipping invalid block at index ${i}`);
        continue;
      }

      try {
        if (block.type === "snippet") {
          processedData.blocks[i] = await verifySnippet(block);
        } else if (block.type === "path") {
          // For path type blocks, just verify the path exists
          processedData.blocks[i] = await verifyPath(block);
        } else {
          console.warn(`Unknown block type "${block.type}" at index ${i}`);
        }
      } catch (blockError) {
        console.error(`Error processing block at index ${i}:`, blockError);
      }
    }

    // Update the timestamp
    processedData.updated = new Date().toISOString();

    return processedData;
  } catch (error) {
    console.error("Error in processJson:", error);
    throw error;
  }
}

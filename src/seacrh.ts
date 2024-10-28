import * as vscode from "vscode";
import { Worker } from "worker_threads";
import * as path from "path";

let searchCancelToken: vscode.CancellationTokenSource | undefined;
const MAX_WORKERS = 4;

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ file: string; resolve: Function }> = [];
  private activeWorkers = 0;

  constructor(private maxWorkers: number, private searchText: string) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        `
                const { parentPort } = require('worker_threads');
                const fs = require('fs');
                
                function findWordPrefixMatches(line, searchText) {
                    const words = line.split(/[^a-zA-Z0-9_-]+/);
                    const matches = [];
                    let currentPosition = 0;
                    
                    for (const word of words) {
                        if (word.toLowerCase().startsWith(searchText.toLowerCase())) {
                            const startIndex = line.indexOf(word, currentPosition);
                            if (startIndex !== -1) {
                                matches.push({
                                    start: startIndex,
                                    end: startIndex + word.length
                                });
                                currentPosition = startIndex + 1;
                            }
                        }
                    }
                    return matches;
                }
                
                parentPort.on('message', async ({ file, searchText }) => {
                    try {
                        const content = fs.readFileSync(file, 'utf8');
                        const lines = content.split('\\n');
                        const results = [];
                        
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            const matches = findWordPrefixMatches(line, searchText);
                            
                            for (const match of matches) {
                                results.push({
                                    line: i + 1,
                                    content: line.trim(),
                                    range: match
                                });
                            }
                        }
                        
                        parentPort.postMessage({ file, results });
                    } catch (error) {
                        parentPort.postMessage({ file, error: error.message });
                    }
                });
            `,
        { eval: true }
      );

      worker.on("message", ({ file, results, error }) => {
        this.activeWorkers--;
        this.processNext();
        this.resolvers.get(file)?.(results || []);
        this.resolvers.delete(file);
      });

      this.workers.push(worker);
    }
  }
  private resolvers = new Map<string, Function>();

  async processFile(file: string): Promise<any[]> {
    return new Promise((resolve) => {
      this.queue.push({ file, resolve });
      this.processNext();
    });
  }

  private processNext() {
    if (this.activeWorkers < this.maxWorkers && this.queue.length > 0) {
      const { file, resolve } = this.queue.shift()!;
      const worker = this.workers[this.activeWorkers % this.maxWorkers];

      this.resolvers.set(file, resolve);
      this.activeWorkers++;

      worker.postMessage({ file, searchText: this.searchText });
    }
  }

  terminate() {
    this.workers.forEach((worker) => worker.terminate());
  }
}

export async function* searchStringParallel(
  searchText: string,
  webview: vscode.Webview,
  cancelToken: vscode.CancellationToken
): AsyncGenerator<any[]> {
  const batchSize = 20;
  let currentBatch: any[] = [];
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  const workerPool = new WorkerPool(MAX_WORKERS, searchText);

  try {
    const files = await vscode.workspace.findFiles(
      "**/*.*",
      "{**/node_modules/**,.git/**,**/dist/**,**/build/**}"
    );

    const promises: Promise<any[]>[] = [];

    for (const file of files) {
      if (cancelToken.isCancellationRequested) break;

      // Get relative path using VSCode workspace API
      const relativePath = workspaceFolder
        ? vscode.workspace.asRelativePath(file, false)
        : file.fsPath;

      const promise = workerPool.processFile(file.fsPath).then((results) =>
        results.map((result) => ({
          ...result,
          filePath: file.fsPath,
          relativePath: relativePath,
        }))
      );

      promises.push(promise);

      if (promises.length >= MAX_WORKERS * 2) {
        const results = await Promise.all(promises);
        for (const resultSet of results) {
          currentBatch.push(...resultSet);
          if (currentBatch.length >= batchSize) {
            yield currentBatch;
            currentBatch = [];
          }
        }
        promises.length = 0;
      }
    }

    const results = await Promise.all(promises);
    for (const resultSet of results) {
      currentBatch.push(...resultSet);
      if (currentBatch.length >= batchSize) {
        yield currentBatch;
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      yield currentBatch;
    }
  } finally {
    workerPool.terminate();
  }
}

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param fileURL Use `import.meta.url`
 * @returns The current working directory of the file that called this method
 */
export function getCurrentDirectory (fileURL: string) {
	const __filename = fileURLToPath(fileURL);
	return dirname(__filename);
}

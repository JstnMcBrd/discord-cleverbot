import { dirname } from "node:path";
import { fileURLToPath } from "url";

/**
 * // TODO
 */
export function getCurrentDirectory(fileURL: string) {
	const __filename = fileURLToPath(fileURL);
	return dirname(__filename);
}

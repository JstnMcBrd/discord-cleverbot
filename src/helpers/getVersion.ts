import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * // TODO
 */
function getPackageFilePath(): string {
	return join(__dirname, "..", "..", "package.json");
}

/**
 * Retrieves the version number from the npm [package.json](../../package.json) file.
 */
export function getVersion(): string {
	const filePath = getPackageFilePath();
	const file = readFileSync(filePath);
	const fileContents = file.toString();
	const json: unknown = JSON.parse(fileContents);

	if (json instanceof Object && Object.prototype.hasOwnProperty.call(json, "version")) {
		const npmPackage = json as { version: string };
		return npmPackage.version;
	}
	else {
		throw new Error(`The npm package file at ${filePath} is missing the version number`);
	}
}

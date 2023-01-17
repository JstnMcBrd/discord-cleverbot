import fs from "node:fs";

const filePath = "../package.json";

/**
 * Retrieves the version number from the npm [package.json](../../package.json) file.
 */
export function getVersion(): string {
	const json: unknown = JSON.parse(fs.readFileSync(filePath).toString());
	if (json instanceof Object && Object.prototype.hasOwnProperty.call(json, "version")) {
		const npmPackage = json as { version: string };
		return npmPackage.version;
	}
	else {
		throw new Error(`The npm package file at ${filePath} is missing the version number`);
	}
}

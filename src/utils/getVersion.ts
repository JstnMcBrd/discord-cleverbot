import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @returns The version number from the npm [package.json](../../package.json) file
 * @throws If the package file is missing or does not contain the version number
 */
export function getVersion (): string {
	const filePath = join(".", "package.json");
	const file = readFileSync(filePath);
	const fileContents = file.toString();
	const json: unknown = JSON.parse(fileContents);

	if (hasVersionField(json)) {
		return json.version;
	}
	else {
		throw new TypeError("The npm package file is missing the version number.");
	}
}

/**
 * @returns Whether the given JSON has the necessary "version" field
 */
function hasVersionField (json: unknown): json is { version: string } {
	return json instanceof Object
		&& Object.hasOwn(json, "version");
}

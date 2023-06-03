/**
 * Indents strings that have more than one line
 */
export function indent (str: string, numTabs: number): string {
	let tabs = "";
	while (numTabs > 0) {
		tabs += "\t";
		numTabs--;
	}
	return (tabs + str).replaceAll("\n", `\n${tabs}`);
}

/**
 * Sleeps for `ms` milliseconds before resolving.
 *
 * @param ms The number of milliseconds to sleep
 * @returns A promise that resolves in `ms` milliseconds
 */
export function sleep(ms?: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

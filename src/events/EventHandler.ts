import type { Awaitable, ClientEvents } from "discord.js";

import { error } from "../logger.js";

export class EventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
	public readonly name: K;

	public readonly once: boolean = false;

	private execution?: typeof this.execute;

	public constructor (name: K) {
		this.name = name;
	}

	/**
	 * Unnecessary because the name is set in the constructor and defines the generic class type.
	 * Unsafe because the generic type should never change, so the name should never change.
	 */
	// public setName (name: K): this {
	// 	Reflect.set(this, "name", name);
	// 	return this;
	// }

	public setOnce (once: boolean): this {
		Reflect.set(this, "once", once);
		return this;
	}

	public setExecution (execution: typeof this.execute): this {
		this.execution = execution;
		return this;
	}

	public execute (...args: ClientEvents[K]): Awaitable<void> {
		if (this.execution) {
			try {
				return this.execution(...args);
			}
			catch (err) {
				error(err);
			}
		}
	}
}

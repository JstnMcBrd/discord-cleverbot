import type { ClientEvents } from 'discord.js';

import { error } from '../logger.js';

/**
 * Mimics the `SlashCommandBuilder` class from discord.js and the `CommandHandler` class to
 * streamline event handler creation.
 */
export class EventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
	/** The name of this event. */
	public readonly name: K;

	/** Whether this event can only fire once. */
	public readonly once: boolean = false;

	/** The method to call when the event fires. */
	private execution?: typeof this.execute;

	/**
	 * Creates a new event handler, using the `name` parameter to define the generic class type.
	 *
	 * @param name The event that this handler is for
	 */
	public constructor(name: K) {
		this.name = name;
	}

	/**
	 * Unnecessary because the name is set in the constructor and defines the generic class type.
	 * Unsafe because the generic type should never change, so the name should never change.
	 */
	// /**
	//  * Sets the name of the event this handler is for.
	//  *
	//  * @param name The name to use
	//  */
	// public setName (name: K): this {
	// 	Reflect.set(this, "name", name);
	// 	return this;
	// }

	/**
	 * Sets whether this event can only fire once.
	 *
	 * @param once Whether this event can only fire once
	 */
	public setOnce(once: boolean): this {
		Reflect.set(this, 'once', once);
		return this;
	}

	/**
	 * Sets the method to call when the event fires.
	 *
	 * @param execution The method to call
	 */
	public setExecution(execution: typeof this.execute): this {
		this.execution = execution;
		return this;
	}

	/**
	 * This is the callback method for when the event fires.
	 * Calls the event execution method, with proper error handling provided.
	 *
	 * @param args The arguments provided to the callback method (depends on the event)
	 */
	public async execute(...args: ClientEvents[K]): Promise<void> {
		if (this.execution) {
			try {
				await this.execution(...args);
			}
			catch (err) {
				error(`Event handler for "${this.name}" encountered an error:`);
				error(err);
			}
		}
	}
}

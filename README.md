# Discord-Cleverbot

## About

Discord-Cleverbot is a [Discord](https://discord.com/) bot developed in JavaScript that uses the node.js library of [cleverbot-free](https://www.npmjs.com/package/cleverbot-free) to give Cleverbot a presence on Discord. Through the bot, users are able to converse with the [Cleverbot chat bot](https://www.cleverbot.com/). The bot also hosts other features that help integrate it with the Discord chat environment.

This project was started in December 2017 and developed periodically until September 2021. This included several ground-up rewrites to improve functionality, efficiency, and simplicity, resulting in a comparatively simple design today.

## Licensing

Without a specific license, this code is the direct intellectual property of the original developer. It may not be used, modified, or shared without explicit permission.
Please see GitHub's [guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) on licensing.

## Getting started

### Creating a bot

1. Create a new bot account in the [Discord developer portal](https://discord.com/developers/applications/)
2. Copy the access token and application ID of your bot for later

### Setting up the code

3. Run `git pull https://github.com/JstnMcBrd/Discord-Cleverbot.git` to clone the repo
4. Go into the `/accounts` directory, duplicate the `ExampleUsername` folder, and rename it as the username of your bot
5. Inside the new folder, edit `config.json` and replace `example-user-id` with the application ID and `example-token` with the access token

### Running the code

6. In the top directory, run `npm install` to download all necessary packages
7. Run `npm run build` to build the project
8. Run `npm run commands [bot username]` to register slash commands with Discord
9. Run `npm run start [bot username]` to start the bot

### Interacting with the bot

10. Use the URL in `/accounts/[bot username]/config.json` to add your bot to a server
11. Use the `/whitelist` command in a channel to allow the bot to speak there
12. Send messages in the whitelisted channel and watch the bot respond!
# discord-cleverbot

## cleverbot-free Status
[![API Status](https://github.com/IntriguingTiles/cleverbot-free/workflows/API%20Status/badge.svg)](https://github.com/IntriguingTiles/cleverbot-free/actions/workflows/api.yml)

## About

discord-cleverbot is a [Discord](https://discord.com/) bot developed in [TypeScript](https://www.typescriptlang.org/) that uses the [node.js](https://nodejs.org/) module of [cleverbot-free](https://www.npmjs.com/package/cleverbot-free) to give Cleverbot a presence on Discord. Through the bot, users are able to converse with the [Cleverbot chat bot](https://www.cleverbot.com/). The bot also hosts other features that help integrate it with the Discord chat environment.

This project was started in December 2017 and developed periodically until January 2023. This included several ground-up rewrites to improve functionality, efficiency, and simplicity, resulting in a comparatively simple design today.

## Licensing

Without a specific license, this code is the direct intellectual property of the original developer. It may not be used, modified, or shared without explicit permission.
Please see GitHub's [guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) on licensing.

## Getting started

### Creating a bot

1. Create a new bot account in the [Discord Developer Portal](https://discord.com/developers/applications/)
2. Copy the access token of your bot for later

### Setting up the code

3. Run `git pull https://github.com/JstnMcBrd/discord-cleverbot.git` to clone the repo
4. Create a new file called `.env` and add your access token, using `.env.example` as an example

### Running the code

5. In the top directory, run `npm install` to download all necessary packages
6. Run `npm run build` to build the project
7. Run `npm run commands` to register slash commands with Discord
8. Run `npm start` to start the bot

### Interacting with the bot

9. In the **OAuth2**>**URL Generator** tab in the Discord Developer Portal, generate an invite URL with the `applications.commands` scope
10. Use the invite URL to add the bot to a server
11. Use the `/whitelist` command in a channel to allow the bot to speak there
12. Send messages in the whitelisted channel and watch the bot respond!

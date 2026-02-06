# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Use [shields.io](https://shields.io/) for badges in README ([#41](https://github.com/JstnMcBrd/discord-cleverbot/pull/41))
- Use `setInterval` instead of `setTimeout` for scheduled tasks like user activity and refreshing ([#43](https://github.com/JstnMcBrd/discord-cleverbot/pull/43))
- Exit with error code if commands are out-of-sync ([#45](https://github.com/JstnMcBrd/discord-cleverbot/pull/45))
- Set user activity on Client initialization ([#45](https://github.com/JstnMcBrd/discord-cleverbot/pull/45))
- Use `Object.assign` instead of `Reflect.set` ([#49](https://github.com/JstnMcBrd/discord-cleverbot/pull/49))
- Use native Node `.env` file support instead of `dotenv` ([#51](https://github.com/JstnMcBrd/discord-cleverbot/pull/51))
- Add Node version requirement of `>=20.6.0` ([#51](https://github.com/JstnMcBrd/discord-cleverbot/pull/51))
- Change error subtypes to better fit their intended meaning ([#51](https://github.com/JstnMcBrd/discord-cleverbot/pull/51))
- Classify channels using `channel.type` instead of class instances ([#52](https://github.com/JstnMcBrd/discord-cleverbot/pull/52))
- Support `PartialGroupDMChannel` ([#64](https://github.com/JstnMcBrd/discord-cleverbot/pull/64))
- Update runtime to Node 24 ([#67](https://github.com/JstnMcBrd/discord-cleverbot/pull/67), [#133](https://github.com/JstnMcBrd/discord-cleverbot/pull/133))
- Use `clientReady` event instead of `ready` ([#118](https://github.com/JstnMcBrd/discord-cleverbot/pull/118))
- Use for-of loops instead of forEach method ([#143](https://github.com/JstnMcBrd/discord-cleverbot/pull/143))
- Format error embeds as code blocks ([#153](https://github.com/JstnMcBrd/discord-cleverbot/pull/153))

### Added

- Add contributing agreement to README ([#44](https://github.com/JstnMcBrd/discord-cleverbot/pull/44))
- Add a `CHANGELOG.md` file ([#142](https://github.com/JstnMcBrd/discord-cleverbot/pull/142))

### Removed

- Remove user activity manager that set user activity on a regular schedule ([#45](https://github.com/JstnMcBrd/discord-cleverbot/pull/45))

### Fixed

- Fix `undici` vulnerabilities ([#47](https://github.com/JstnMcBrd/discord-cleverbot/pull/47))
- Fix `ws` vulnerability ([#50](https://github.com/JstnMcBrd/discord-cleverbot/pull/50))
- Filter out duplicate channel IDs from whitelist ([#52](https://github.com/JstnMcBrd/discord-cleverbot/pull/52))
- Fix `form-data` vulnerability ([#111](https://github.com/JstnMcBrd/discord-cleverbot/pull/111))

## [5.1.0] - 2024-02-13

### Changed

- Update runtime to Node 20 ([#32](https://github.com/JstnMcBrd/discord-cleverbot/pull/32))
- Reformat code with new `eslint` config ([#33](https://github.com/JstnMcBrd/discord-cleverbot/pull/33), [#34](https://github.com/JstnMcBrd/discord-cleverbot/pull/34), [#36](https://github.com/JstnMcBrd/discord-cleverbot/pull/36))

### Added

- Add more fields to `package.json` ([#35](https://github.com/JstnMcBrd/discord-cleverbot/pull/35), [#39](https://github.com/JstnMcBrd/discord-cleverbot/pull/39))
- Add button with link to source code in `/help` embed ([#38](https://github.com/JstnMcBrd/discord-cleverbot/pull/38))
- Add button to report bug to error embed ([#39](https://github.com/JstnMcBrd/discord-cleverbot/pull/39))

### Removed

- Remove redundant `replaceCustomEmojis` method - this functionality was added to `discord.js` in [`v14.14.0`](https://github.com/discordjs/discord.js/releases/tag/14.14.0) ([#28](https://github.com/JstnMcBrd/discord-cleverbot/pull/28))

### Fixed

- Fix `undici` vulnerability ([#28](https://github.com/JstnMcBrd/discord-cleverbot/pull/28))

## [5.0.1] - 2023-10-07

### Changed

- Improve grammar and wording in README ([#20](https://github.com/JstnMcBrd/discord-cleverbot/pull/20), [#25](https://github.com/JstnMcBrd/discord-cleverbot/pull/25))

### Fixed

- Fix README saying "git pull" instead of "git clone" ([#20](https://github.com/JstnMcBrd/discord-cleverbot/pull/20))
- Fix permissions in invite link ([#20](https://github.com/JstnMcBrd/discord-cleverbot/pull/20))
- Fix dependency vulnerabilities ([#20](https://github.com/JstnMcBrd/discord-cleverbot/pull/20))
- Bump `cleverbot-free` from `v2.0.0` to `v2.0.1` to fix "Bad Gateway" errors... again ([#24](https://github.com/JstnMcBrd/discord-cleverbot/pull/24))
- Fix broken API status link in README ([#25](https://github.com/JstnMcBrd/discord-cleverbot/pull/25))

## [5.0.0] - 2023-06-17

### Changed

- Rename project from `Discord-Cleverbot` to `discord-cleverbot` ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Completely refactor and reorganize all code ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Migrate code to TypeScript ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Modernize JavaScript syntax ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Follow `discord.js` best practices ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Refactor how slash commands and event handlers are managed ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Refactor whitelist, context, thinking, and user activity management ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Automatically generate whitelist file if missing ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Speed up whitelist fetching and validating using parallel promises ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Automatically generate context on startup instead of after a first message ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Automatically generate/delete context for channels when whitelist is updated ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Speed up context generation using parallel promises ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Limit context length to 10 messages ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Add automatic timeout for thinking storage ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Regularly refresh the bot by validating the whitelist, regenerating context, and resuming conversations ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Increase typing speed from 6 char/sec to 8 char/sec ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Automatically check on startup if deployed commands are out-of-sync ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Use ephemeral replies for slash commands ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Make all embeds use a default color palette ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Use command mentions for all embeds that mention commands ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Use environment variables for sensitive tokens instead of `config.json` ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Bump `cleverbot-free` from v1 to v2 to improve error handling ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Refactor `package.json` to follow best practices for a NodeJS project ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Update documentation in README for complete refactor ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Improve README to be more concise ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))

### Added

- Add new `/invite` command with automatic invite link generation ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Add NPM package version number to `/help` embed ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Add `cleverbot-free` API status to README ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Add "Development" section to README ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))

### Removed

- Remove reset feature for `deploy-commands` script ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Remove unnecessary `GuildTyping` and `DMTyping` GatewayIntentBits from the client ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))

### Fixed

- Fix setTimeout methods crashing ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Fix emoji replacement replacing innocent underscores and colons ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))
- Prevent context generation from gathering messages sent before channel was whitelisted ([#19](https://github.com/JstnMcBrd/discord-cleverbot/pull/19))

## [4.7.0] - 2022-09-25

### Changed

- Reformat code with `eslint` ([f408ac7](https://github.com/JstnMcBrd/discord-cleverbot/commit/f408ac794649fdda13534ec7adc9b7ca9ee3d0e6))
- Refactor to better fit `discord.js` best practices ([b43ee6a](https://github.com/JstnMcBrd/discord-cleverbot/commit/b43ee6a611581eb2391d00bf4557e762dc5d091c))

### Added

- Add argument validation to `deploy-commands` script ([b43ee6a](https://github.com/JstnMcBrd/discord-cleverbot/commit/b43ee6a611581eb2391d00bf4557e762dc5d091c))
- Add reset feature to `deploy-commands` script ([b43ee6a](https://github.com/JstnMcBrd/discord-cleverbot/commit/b43ee6a611581eb2391d00bf4557e762dc5d091c))

## [4.6.0] - 2022-09-24

### Changed

- Move slash command registration to separate script ([d2e9f7a](https://github.com/JstnMcBrd/discord-cleverbot/commit/d2e9f7a29742c6da2a4067127d07670a42d19b17))
- Refactor to better fit `discord.js` best practices ([d2e9f7a](https://github.com/JstnMcBrd/discord-cleverbot/commit/d2e9f7a29742c6da2a4067127d07670a42d19b17))

### Added

- Add sections on licensing and development to README ([84ef386](https://github.com/JstnMcBrd/discord-cleverbot/commit/84ef38699ce627f4b31aa992a888228a83a9cdec))

### Fixed

- Fix bug removing mentions from messages ([d2e9f7a](https://github.com/JstnMcBrd/discord-cleverbot/commit/d2e9f7a29742c6da2a4067127d07670a42d19b17))

## [4.5.1] - 2022-08-19

### Fixed

- Fix `undici` vulnerability ([b8783ce](https://github.com/JstnMcBrd/discord-cleverbot/commit/b8783ce5a75b20b8a41ecd7408323c3d574f541a))

## [4.5.0] - 2022-08-15

### Fixed

- Fix bug setting user activity ([6ee4d4c](https://github.com/JstnMcBrd/discord-cleverbot/commit/6ee4d4cb4fab24f8a29748ce2673f3342b4ab721))

## [4.4.0] - 2022-08-03

### Changed

- Bump `discord.js` from v13 to v14 ([b49f8ec](https://github.com/JstnMcBrd/discord-cleverbot/commit/b49f8ecfb8059c4f1ffb2dc740b42f105b6da101))
- Support `discord.js` v14 ([b49f8ec](https://github.com/JstnMcBrd/discord-cleverbot/commit/b49f8ecfb8059c4f1ffb2dc740b42f105b6da101))

## [4.3.3] - 2022-07-13

### Fixed

- Replace sabotaged `colors` package with new `@colors/colors` package ([75c0ec3](https://github.com/JstnMcBrd/discord-cleverbot/commit/75c0ec30ff9a814f885e5b73739773c4a266cbc8))

## [4.3.2] - 2022-04-20

### Fixed

- Bump `cleverbot-free` from `v1.1.10` to `v1.1.11` to fix "Bad Gateway" errors... again ([7a2a3b3](https://github.com/JstnMcBrd/discord-cleverbot/commit/7a2a3b379f4e03c103bdfad8ca19b2bc1237c923))

## [4.3.1] - 2022-04-01

### Fixed

- Bump `cleverbot-free` from `v1.1.8` to `v1.1.10` to fix crashes when bot is running for too long... again ([d11d768](https://github.com/JstnMcBrd/discord-cleverbot/commit/d11d7683e8190c8205d938c48f1ad94e79d6f99f))

## [4.3.0] - 2022-03-07

### Changed

- Improve wording in README ([f9a4cc5](https://github.com/JstnMcBrd/discord-cleverbot/commit/f9a4cc50877d8fb5f76451ef20f72e1506922276))

### Fixed

- Bump `cleverbot-free` from `v1.1.7` to `v1.1.8` to fix crashes when bot is running for too long ([d11d768](https://github.com/JstnMcBrd/discord-cleverbot/commit/d11d7683e8190c8205d938c48f1ad94e79d6f99f))

## [4.2.4] - 2022-01-06

### Fixed

- Prevent sending empty responses from Cleverbot to Discord ([4baff65](https://github.com/JstnMcBrd/discord-cleverbot/commit/4baff657c397fe4692d208724164c314b7a3377c))

## [4.2.3] - 2021-10-28

### Fixed

- Fix weird formatting of error messages sent to Discord ([e1d0717](https://github.com/JstnMcBrd/discord-cleverbot/commit/e1d071771576c27d10aaa36c01b82319d55e8bbf))

## [4.2.2] - 2021-10-18

### Fixed

- Standardize capitalization from "CleverBot" to "Cleverbot" ([c359e03](https://github.com/JstnMcBrd/discord-cleverbot/commit/c359e037b0867ea0b89d5387f89d222f50b7c057))

## [4.2.1] - 2021-10-17

### Fixed

- Bump `cleverbot-free` from `v1.1.6` to `v1.1.7` to fix "Bad Gateway" errors ([db0cdff](https://github.com/JstnMcBrd/discord-cleverbot/commit/db0cdff217ed1dc56c80c42ce53ce23c6bd8876f))

## [4.2.0] - 2021-09-17

### Changed

- Refactor emoji conversion system to improve Cleverbot comprehension, handle custom emojis ([febeb49](https://github.com/JstnMcBrd/discord-cleverbot/commit/febeb496690299a50c63681b5694031e81547e41))

## [4.1.0] - 2021-09-15

### Changed

- Log if user activity is not set correctly ([293a6d1](https://github.com/JstnMcBrd/discord-cleverbot/commit/293a6d1aaa4675e6db2b08037f03e1440325aff0))
- Refactor conversation resumption to improve error tolerance ([293a6d1](https://github.com/JstnMcBrd/discord-cleverbot/commit/293a6d1aaa4675e6db2b08037f03e1440325aff0))
- Repeat conversation resumption on a regular schedule ([293a6d1](https://github.com/JstnMcBrd/discord-cleverbot/commit/293a6d1aaa4675e6db2b08037f03e1440325aff0))
- Improve emoji conversion system ([293a6d1](https://github.com/JstnMcBrd/discord-cleverbot/commit/293a6d1aaa4675e6db2b08037f03e1440325aff0))

### Removed

- Remove thumbnail from help embed ([379a07a](https://github.com/JstnMcBrd/discord-cleverbot/commit/379a07ae6e4d9555c28330ade447d789e3006246))

### Fixed

- Fix crash when logging messages from DMs ([293a6d1](https://github.com/JstnMcBrd/discord-cleverbot/commit/293a6d1aaa4675e6db2b08037f03e1440325aff0))

## [4.0.0] - 2021-09-06

### Changed

- Update wording in README ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Refactor and reorganize everything ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Improve error handling ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Use dedicated file for whitelist memory ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Improve debug output ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))

### Added

- Use Discord's new slash command system for `/help`, `/whitelist`, and `/unwhitelist` ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Support threads ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Use "reply" feature when responding to message that is not the most recent ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))

### Removed

- Remove support for running on user accounts ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Remove unnecessary emoji conversion between Cleverbot and Discord ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))

### Fixed

- Support DMs again ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Fix conversation context not being generated in time to respond to first-time messages ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))
- Reset user activity periodically to avoid disappearing ([cdf38fd](https://github.com/JstnMcBrd/discord-cleverbot/commit/cdf38fd1d75f843f698291f804f79e1f7d1bd907))

## [3.2.1] - 2021-08-24

### Fixed

- Retry response generation after `cleverbot-free` timeouts ([b9ec394](https://github.com/JstnMcBrd/discord-cleverbot/commit/b9ec394f0b6238235963ed7cb73ef09770307d0a))

## [3.2.0] - 2021-08-23

### Changed

- Update project description in README ([2775c66](https://github.com/JstnMcBrd/discord-cleverbot/commit/2775c66f273470e52ef76ebeaa19a0f56ccb7b20))
- Bump `discord.js` from v11 to v13 ([2775c66](https://github.com/JstnMcBrd/discord-cleverbot/commit/2775c66f273470e52ef76ebeaa19a0f56ccb7b20))
- Refactor code to support `discord.js` v13 ([2775c66](https://github.com/JstnMcBrd/discord-cleverbot/commit/2775c66f273470e52ef76ebeaa19a0f56ccb7b20))

## [3.1.2] - 2020-09-25

### Fixed

- Ignore messages in muted servers for user accounts ([d2ecaba](https://github.com/JstnMcBrd/discord-cleverbot/commit/d2ecaba90b3262c02d4a7e4d10119859156238d7))

## [3.1.1] - 2020-09-20

### Fixed

- Ignore new messages until current response has finished typing ([b835a5b](https://github.com/JstnMcBrd/discord-cleverbot/commit/b835a5b36ee1449ca1e8b8687f6db926c2997f06))

## [3.1.0] - 2020-09-20

### Changed

- Update README to explain revival with `cleverbot-free` ([92bdf8c](https://github.com/JstnMcBrd/discord-cleverbot/commit/92bdf8cc22bac8b16750b1fc20cdc495950acbad))
- Refactor whitelist commands to use functions ([089ed49](https://github.com/JstnMcBrd/discord-cleverbot/commit/089ed49fa143b50888f5060443ed08c8558c35d7))

### Added

- Support running on user accounts ([089ed49](https://github.com/JstnMcBrd/discord-cleverbot/commit/089ed49fa143b50888f5060443ed08c8558c35d7))

### Removed

- Remove `cleverbot.io` dependency ([92bdf8c](https://github.com/JstnMcBrd/discord-cleverbot/commit/92bdf8cc22bac8b16750b1fc20cdc495950acbad))
- Remove old files  ([e5bf193](https://github.com/JstnMcBrd/discord-cleverbot/commit/e5bf1935d57704dd3b78d5b08f7ad98d4cae0bb9))

## [3.0.0] - 2020-09-18

### Changed

- Add basic description to README ([d77cd62](https://github.com/JstnMcBrd/discord-cleverbot/commit/d77cd62065f5aeecf53033999c514cf262abcc77), [986df95](https://github.com/JstnMcBrd/discord-cleverbot/commit/986df953a451b54ec53324ef6f779b483af588d0))
- Refactor to move from `cleverbot.io` package to `cleverbot-free` package ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))
- Slow down responses to avoid Discord "chill zone" ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))
- Refactor code to use functions ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))

### Added

- Add ability to build conversation context by storing past messages ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))
- Add ability to scan message history to respond to first valid unread message ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))
- Add ability to translate messages between Discord and Cleverbot formats ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))

### Fixed

- Prevent bot from responding to commands/ignored messages on startup ([2662fb3](https://github.com/JstnMcBrd/discord-cleverbot/commit/2662fb385f2d481be4af07dc19b2adf5e99aeee3))

## [2.0.0] - 2020-09-17

### Added

- Add empty README ([1025728](https://github.com/JstnMcBrd/discord-cleverbot/commit/10257283a9f5e8af376a8969fe62fb34a89ffb54))
- Add initial code ([81fef9a](https://github.com/JstnMcBrd/discord-cleverbot/commit/81fef9af2a008b6f7a03e8a313c7786425557608))

[Unreleased]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v5.1.0...HEAD
[5.1.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v5.0.1...v5.1.0
[5.0.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.7.0...v5.0.0
[4.7.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.6.0...v4.7.0
[4.6.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.5.1...v4.6.0
[4.5.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.5.0...v4.5.1
[4.5.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.4.0...v4.5.0
[4.4.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.3.3...v4.4.0
[4.3.3]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.3.2...v4.3.3
[4.3.2]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.3.1...v4.3.2
[4.3.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.3.0...v4.3.1
[4.3.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.2.4...v4.3.0
[4.2.4]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.2.3...v4.2.4
[4.2.3]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.2.2...v4.2.3
[4.2.2]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.2.1...v4.2.2
[4.2.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.2.0...v4.2.1
[4.2.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.2.1...v4.0.0
[3.2.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.1.2...v3.2.0
[3.1.2]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/JstnMcBrd/discord-cleverbot/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/JstnMcBrd/discord-cleverbot/tree/v2.0.0

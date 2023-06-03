import globals from "globals";
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

export default [
	{
		ignores: [ "node_modules", "dist", ".misc" ],
	},
	{
		files: [ "**/*.js", "**/*.ts" ],
		languageOptions: {
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.es2022,
			},
		},
		rules: {
			...js.configs.recommended.rules,
			"arrow-spacing": "error",
			"brace-style": ["error", "stroustrup"],
			"comma-dangle": ["error", "always-multiline"],
			"comma-spacing": "error",
			"comma-style": "error",
			"curly": ["error", "multi-line", "consistent"],
			"dot-location": ["error", "property"],
			"eol-last": ["error", "always"],
			"handle-callback-err": "off",
			"indent": ["error", "tab"],
			"keyword-spacing": "error",
			"max-nested-callbacks": ["error", { "max": 4 }],
			"max-statements-per-line": ["error", { "max": 2 }],
			"no-console": "off",
			"no-empty-function": "error",
			"no-floating-decimal": "error",
			"no-inline-comments": "error",
			"no-lonely-if": "error",
			"no-multi-spaces": "error",
			"no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],
			"no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
			"no-trailing-spaces": "error",
			"no-var": "error",
			"object-curly-spacing": ["error", "always"],
			"prefer-const": "error",
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"space-before-blocks": "error",
			"space-before-function-paren": ["error", { "anonymous": "never", "named": "never", "asyncArrow": "always" }],
			"space-in-parens": "error",
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			"spaced-comment": "error",
			"yoda": "error",
		},
	},
	{
		files: [ "**/*.ts" ],
		plugins: {
			"@typescript-eslint": typescriptPlugin,
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: "./",
			},
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules,
			...typescriptPlugin.configs["recommended-requiring-type-checking"].rules,
		},
	},
];

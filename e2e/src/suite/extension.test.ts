import * as assert from "assert"
import * as vscode from "vscode"

suite("Magic Code Extension", () => {
	test("OPENROUTER_API_KEY environment variable is set", () => {
		if (!process.env.OPENROUTER_API_KEY) {
			assert.fail("OPENROUTER_API_KEY environment variable is not set")
		}
	})

	test("Commands should be registered", async () => {
		const expectedCommands = [
			"magic-code.plusButtonClicked",
			"magic-code.mcpButtonClicked",
			"magic-code.historyButtonClicked",
			"magic-code.popoutButtonClicked",
			"magic-code.settingsButtonClicked",
			"magic-code.openInNewTab",
			"magic-code.explainCode",
			"magic-code.fixCode",
			"magic-code.improveCode",
		]

		const commands = await vscode.commands.getCommands(true)

		for (const cmd of expectedCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`)
		}
	})
})

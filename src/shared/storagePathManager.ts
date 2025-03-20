import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"

/**
 * Gets the base storage path for conversations
 * If a custom path is configured, uses that path
 * Otherwise uses the default VSCode extension global storage path
 */
export async function getStorageBasePath(defaultPath: string): Promise<string> {
	// Get user-configured custom storage path
	let customStoragePath = ""

	try {
		// This is the line causing the error in tests
		const config = vscode.workspace.getConfiguration("roo-cline")
		customStoragePath = config.get<string>("customStoragePath", "")
	} catch (error) {
		console.warn("Could not access VSCode configuration - using default path")
		return defaultPath
	}

	// If no custom path is set, use default path
	if (!customStoragePath) {
		return defaultPath
	}

	try {
		// Ensure custom path exists
		await fs.mkdir(customStoragePath, { recursive: true })

		// Test if path is writable
		const testFile = path.join(customStoragePath, ".write_test")
		await fs.writeFile(testFile, "test")
		await fs.rm(testFile)

		return customStoragePath
	} catch (error) {
		// If path is unusable, report error and fall back to default path
		console.error(`Custom storage path is unusable: ${error instanceof Error ? error.message : String(error)}`)
		if (vscode.window) {
			vscode.window.showErrorMessage(
				`Custom storage path "${customStoragePath}" is unusable, will use default path`,
			)
		}
		return defaultPath
	}
}

/**
 * Gets the storage directory path for a task
 */
export async function getTaskDirectoryPath(globalStoragePath: string, taskId: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const taskDir = path.join(basePath, "tasks", taskId)
	await fs.mkdir(taskDir, { recursive: true })
	return taskDir
}

/**
 * Gets the settings directory path
 */
export async function getSettingsDirectoryPath(globalStoragePath: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const settingsDir = path.join(basePath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })
	return settingsDir
}

/**
 * Gets the cache directory path
 */
export async function getCacheDirectoryPath(globalStoragePath: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const cacheDir = path.join(basePath, "cache")
	await fs.mkdir(cacheDir, { recursive: true })
	return cacheDir
}

/**
 * Prompts the user to set a custom storage path
 * Displays an input box allowing the user to enter a custom path
 */
export async function promptForCustomStoragePath(): Promise<void> {
	if (!vscode.window || !vscode.workspace) {
		console.error("VS Code API not available")
		return
	}

	let currentPath = ""
	try {
		const currentConfig = vscode.workspace.getConfiguration("roo-cline")
		currentPath = currentConfig.get<string>("customStoragePath", "")
	} catch (error) {
		console.error("Could not access configuration")
		return
	}

	const result = await vscode.window.showInputBox({
		value: currentPath,
		placeHolder: "D:\\RooCodeStorage",
		prompt: "Enter custom conversation history storage path, leave empty to use default location",
		validateInput: (input) => {
			if (!input) {
				return null // Allow empty value (use default path)
			}

			try {
				// Validate path format
				path.parse(input)

				// Check if path is absolute
				if (!path.isAbsolute(input)) {
					return "Please enter an absolute path (e.g. D:\\RooCodeStorage or /home/user/storage)"
				}

				return null // Path format is valid
			} catch (e) {
				return "Please enter a valid path"
			}
		},
	})

	// If user canceled the operation, result will be undefined
	if (result !== undefined) {
		try {
			const currentConfig = vscode.workspace.getConfiguration("roo-cline")
			await currentConfig.update("customStoragePath", result, vscode.ConfigurationTarget.Global)

			if (result) {
				try {
					// Test if path is accessible
					await fs.mkdir(result, { recursive: true })
					vscode.window.showInformationMessage(`Custom storage path set: ${result}`)
				} catch (error) {
					vscode.window.showErrorMessage(
						`Cannot access path ${result}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			} else {
				vscode.window.showInformationMessage("Reverted to using default storage path")
			}
		} catch (error) {
			console.error("Failed to update configuration", error)
		}
	}
}

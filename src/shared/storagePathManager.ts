import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"

/**
 * 获取对话存储的基础路径
 * 如果用户配置了自定义路径，则使用自定义路径
 * 否则使用默认的VSCode扩展全局存储路径
 */
export async function getStorageBasePath(defaultPath: string): Promise<string> {
	// 获取用户配置的自定义存储路径
	const config = vscode.workspace.getConfiguration("magic-code")
	const customStoragePath = config.get<string>("customStoragePath", "")

	// 如果没有设置自定义路径，使用默认路径
	if (!customStoragePath) {
		return defaultPath
	}

	try {
		// 确保自定义路径存在
		await fs.mkdir(customStoragePath, { recursive: true })

		// 测试路径是否可写
		const testFile = path.join(customStoragePath, ".write_test")
		await fs.writeFile(testFile, "test")
		await fs.rm(testFile)

		return customStoragePath
	} catch (error) {
		// 如果路径无法使用，报告错误并回退到默认路径
		console.error(`自定义存储路径无法使用: ${error instanceof Error ? error.message : String(error)}`)
		vscode.window.showErrorMessage(`自定义存储路径 "${customStoragePath}" 无法使用，将使用默认路径`)
		return defaultPath
	}
}

/**
 * 获取任务的存储目录路径
 */
export async function getTaskDirectoryPath(globalStoragePath: string, taskId: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const taskDir = path.join(basePath, "tasks", taskId)
	await fs.mkdir(taskDir, { recursive: true })
	return taskDir
}

/**
 * 获取设置目录路径
 */
export async function getSettingsDirectoryPath(globalStoragePath: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const settingsDir = path.join(basePath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })
	return settingsDir
}

/**
 * 获取缓存目录路径
 */
export async function getCacheDirectoryPath(globalStoragePath: string): Promise<string> {
	const basePath = await getStorageBasePath(globalStoragePath)
	const cacheDir = path.join(basePath, "cache")
	await fs.mkdir(cacheDir, { recursive: true })
	return cacheDir
}

/**
 * 提示用户设置自定义存储路径
 * 显示一个输入框，允许用户输入自定义路径
 */
export async function promptForCustomStoragePath(): Promise<void> {
	const currentConfig = vscode.workspace.getConfiguration("magic-code")
	const currentPath = currentConfig.get<string>("customStoragePath", "")

	const result = await vscode.window.showInputBox({
		value: currentPath,
		placeHolder: "D:\\MagicCodeStorage",
		prompt: "输入自定义对话历史存储路径，留空使用默认位置",
		validateInput: (input) => {
			if (!input) {
				return null // 允许空值（使用默认路径）
			}

			try {
				// 简单验证路径的有效性
				path.parse(input)
				return null // 路径格式有效
			} catch (e) {
				return "请输入有效的路径"
			}
		},
	})

	// 如果用户取消了操作，result会是undefined
	if (result !== undefined) {
		await currentConfig.update("customStoragePath", result, vscode.ConfigurationTarget.Global)

		if (result) {
			try {
				// 测试路径是否可访问
				await fs.mkdir(result, { recursive: true })
				vscode.window.showInformationMessage(`已设置自定义存储路径: ${result}`)
			} catch (error) {
				vscode.window.showErrorMessage(
					`无法访问路径 ${result}: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		} else {
			vscode.window.showInformationMessage("已恢复使用默认存储路径")
		}
	}
}

import defaultShell from "default-shell"
import os from "os"
import osName from "os-name"
import { Mode, ModeConfig, getModeBySlug, defaultModeSlug, isToolAllowedForMode } from "../../../shared/modes"
import { getShell } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string, currentMode: Mode, customModes?: ModeConfig[]): string {
	const findModeBySlug = (slug: string, modes?: ModeConfig[]) => modes?.find((m) => m.slug === slug)

	const currentModeName = findModeBySlug(currentMode, customModes)?.name || currentMode
	const codeModeName = findModeBySlug(defaultModeSlug, customModes)?.name || "Code"

	let details = `====

系统信息

操作系统: ${osName()}
默认Shell: ${getShell()}
主目录: ${os.homedir().toPosix()}
当前工作目录: ${cwd.toPosix()}

当用户最初给您一个任务时，当前工作目录('/test/path')中所有文件路径的递归列表将包含在environment_details中。这提供了项目文件结构的概览，通过目录/文件名（开发人员如何概念化和组织他们的代码）和文件扩展名（使用的语言）提供对项目的关键洞察。这也可以指导您决定哪些文件需要进一步探索。如果您需要进一步探索当前工作目录外的目录，可以使用list_files工具。如果您为recursive参数传递'true'，它将递归列出文件。否则，它将仅列出顶层文件，这更适合于您不一定需要嵌套结构的通用目录，如桌面。`

	return details
}

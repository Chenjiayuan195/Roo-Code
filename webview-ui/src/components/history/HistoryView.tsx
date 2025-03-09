import React, { memo, useState } from "react"
import { DeleteTaskDialog } from "./DeleteTaskDialog"
import prettyBytes from "pretty-bytes"
import { Virtuoso } from "react-virtuoso"
import { VSCodeButton, VSCodeTextField, VSCodeRadioGroup, VSCodeRadio, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"

import { vscode } from "@/utils/vscode"
import { formatLargeNumber, formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui"

import { useTaskSearch } from "./useTaskSearch"
import { ExportButton } from "./ExportButton"
import { CopyButton } from "./CopyButton"

type HistoryViewProps = {
	onDone: () => void
}

type SortOption = "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"

const HistoryView = ({ onDone }: HistoryViewProps) => {
	const { tasks, searchQuery, setSearchQuery, sortOption, setSortOption, setLastNonRelevantSort } = useTaskSearch()

	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

	const sortOptions = [
		{ value: "newest", label: "最新" },
		{ value: "oldest", label: "最旧" },
		{ value: "mostRelevant", label: "最相关" },
		{ value: "mostExpensive", label: "最昂贵" },
		{ value: "mostTokens", label: "最多令牌" },
	]

	return (
		<div className="fixed inset-0 flex flex-col">
			<div className="flex flex-col gap-2 px-5 py-2.5 border-b border-vscode-panel-border">
				<div className="flex justify-between items-center">
					<h3 className="text-vscode-foreground m-0">历史记录</h3>
					<VSCodeButton onClick={onDone}>完成</VSCodeButton>
				</div>
				<div className="flex flex-col gap-2">
					<VSCodeTextField
						style={{ width: "100%" }}
						placeholder="搜索历史..."
						value={searchQuery}
						onInput={(e) => {
							const target = (e as any).target as HTMLInputElement
							setSearchQuery(target.value)
							if (target.value && !searchQuery && sortOption !== "mostRelevant") {
								setLastNonRelevantSort(sortOption)
								setSortOption("mostRelevant")
							}
						}}
					>
						<div
							slot="start"
							className="codicon codicon-search"
							style={{ fontSize: 13, marginTop: 2.5, opacity: 0.8 }}
						/>
						{searchQuery && (
							<div
								className="input-icon-button codicon codicon-close"
								aria-label="Clear search"
								onClick={(e) => {
									e.stopPropagation()
									setSearchQuery("")
								}}
								slot="end"
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									height: "100%",
								}}
							/>
						)}
					</VSCodeTextField>
					<div>
						<VSCodeDropdown
							value={sortOption}
							onChange={(e: any) => setSortOption(e.target.value)}
							style={{ minWidth: "150px" }}>
							{sortOptions.map((option) => (
								<VSCodeOption key={option.value} value={option.value}>
									{option.label}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</div>
				</div>
			</div>
			<div style={{ flexGrow: 1, overflowY: "auto", margin: 0 }}>
				<Virtuoso
					style={{
						flexGrow: 1,
						overflowY: "scroll",
					}}
					data={tasks}
					data-testid="virtuoso-container"
					components={{
						List: React.forwardRef((props, ref) => (
							<div {...props} ref={ref} data-testid="virtuoso-item-list" />
						)),
					}}
					itemContent={(index, item) => (
						<div
							data-testid={`task-item-${item.id}`}
							key={item.id}
							className={cn("cursor-pointer", {
								"border-b border-vscode-panel-border": index < tasks.length - 1,
							})}
							onClick={() => vscode.postMessage({ type: "showTaskWithId", text: item.id })}>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
									padding: "12px 20px",
									position: "relative",
								}}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}>
									<span
										style={{
											color: "var(--vscode-descriptionForeground)",
											fontWeight: 500,
											fontSize: "0.85em",
											textTransform: "uppercase",
										}}>
										{formatDate(item.ts)}
									</span>
									<div className="flex flex-row">
										<Button
											variant="ghost"
											size="sm"
											title="删除任务（按住Shift并点击可跳过确认）"
											onClick={(e) => {
												e.stopPropagation()

												if (e.shiftKey) {
													vscode.postMessage({ type: "deleteTaskWithId", text: item.id })
												} else {
													setDeleteTaskId(item.id)
												}
											}}>
											<span className="codicon codicon-trash" />
											{item.size && prettyBytes(item.size)}
										</Button>
									</div>
								</div>
								<div
									style={{
										fontSize: "var(--vscode-font-size)",
										color: "var(--vscode-foreground)",
										display: "-webkit-box",
										WebkitLineClamp: 3,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										overflowWrap: "anywhere",
									}}
									dangerouslySetInnerHTML={{ __html: item.task }}
								/>
								<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
									<div
										data-testid="tokens-container"
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
												flexWrap: "wrap",
											}}>
											<span
												style={{
													fontWeight: 500,
													color: "var(--vscode-descriptionForeground)",
												}}>
												Tokens:
											</span>
											<span
												data-testid="tokens-in"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "3px",
													color: "var(--vscode-descriptionForeground)",
												}}>
												<i
													className="codicon codicon-arrow-up"
													style={{
														fontSize: "12px",
														fontWeight: "bold",
														marginBottom: "-2px",
													}}
												/>
												{formatLargeNumber(item.tokensIn || 0)}
											</span>
											<span
												data-testid="tokens-out"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "3px",
													color: "var(--vscode-descriptionForeground)",
												}}>
												<i
													className="codicon codicon-arrow-down"
													style={{
														fontSize: "12px",
														fontWeight: "bold",
														marginBottom: "-2px",
													}}
												/>
												{formatLargeNumber(item.tokensOut || 0)}
											</span>
										</div>
										{!item.totalCost && (
											<div className="flex flex-row gap-1">
												<CopyButton itemTask={item.task} />
												<ExportButton itemId={item.id} />
											</div>
										)}
									</div>

									{!!item.cacheWrites && (
										<div
											data-testid="cache-container"
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
												flexWrap: "wrap",
											}}>
											<span
												style={{
													fontWeight: 500,
													color: "var(--vscode-descriptionForeground)",
												}}>
												Cache:
											</span>
											<span
												data-testid="cache-writes"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "3px",
													color: "var(--vscode-descriptionForeground)",
												}}>
												<i
													className="codicon codicon-database"
													style={{
														fontSize: "12px",
														fontWeight: "bold",
														marginBottom: "-1px",
													}}
												/>
												+{formatLargeNumber(item.cacheWrites || 0)}
											</span>
											<span
												data-testid="cache-reads"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "3px",
													color: "var(--vscode-descriptionForeground)",
												}}>
												<i
													className="codicon codicon-arrow-right"
													style={{
														fontSize: "12px",
														fontWeight: "bold",
														marginBottom: 0,
													}}
												/>
												{formatLargeNumber(item.cacheReads || 0)}
											</span>
										</div>
									)}

									{!!item.totalCost && (
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginTop: -2,
											}}>
											<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
												<span
													style={{
														fontWeight: 500,
														color: "var(--vscode-descriptionForeground)",
													}}>
													API Cost:
												</span>
												<span style={{ color: "var(--vscode-descriptionForeground)" }}>
													${item.totalCost?.toFixed(4)}
												</span>
											</div>
											<div className="flex flex-row gap-1">
												<CopyButton itemTask={item.task} />
												<ExportButton itemId={item.id} />
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				/>
			</div>
			{deleteTaskId && (
				<DeleteTaskDialog taskId={deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)} open />
			)}
		</div>
	)
}

export default memo(HistoryView)

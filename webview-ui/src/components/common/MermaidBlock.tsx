import React from "react"
import styled from "styled-components"

interface MermaidBlockProps {
	code: string
}

// 暂时简化MermaidBlock组件以解决构建问题
export default function MermaidBlock({ code }: MermaidBlockProps) {
	return (
		<pre style={{ 
			backgroundColor: 'var(--vscode-editor-background)', 
			padding: '10px', 
			borderRadius: '4px', 
			overflow: 'auto' 
		}}>
			<code>{code}</code>
		</pre>
	)
}

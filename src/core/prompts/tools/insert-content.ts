import { ToolArgs } from "./types"

export function getInsertContentDescription(args: ToolArgs): string {
	return `## insert_content
描述: 在文件的特定行位置插入内容。这是添加新内容和代码（函数/方法/类、导入、属性等）的主要工具，因为它允许精确插入而不覆盖现有内容。该工具使用高效的基于行的插入系统，保持文件完整性和多个插入的正确顺序。注意使用正确的缩进。这是向文件添加新内容和代码的首选方式。
参数:
- path: (必填) 要插入内容的文件路径（相对于当前工作目录 ${args.cwd.toPosix()}）
- operations: (必填) 插入操作的 JSON 数组。每个操作是一个对象，包含：
    * start_line: (必填) 应插入内容的行号。该行当前的内容将出现在插入内容的下方。
    * content: (必填) 要在指定位置插入的内容。重要说明：如果内容是单行，可以是字符串。如果是多行内容，应该是带有换行符（\n）的字符串。确保为内容包含正确的缩进。
用法:
<insert_content>
<path>文件路径</path>
<operations>[
  {
    "start_line": 10,
    "content": "您的内容"
  }
]</operations>
</insert_content>
示例: 插入新函数及其导入语句
<insert_content>
<path>文件路径</path>
<operations>[
  {
    "start_line": 1,
    "content": "import { sum } from './utils';"
  },
  {
    "start_line": 10,
    "content": "function calculateTotal(items: number[]): number {\n    return items.reduce((sum, item) => sum + item, 0);\n}"
  }
]</operations>
</insert_content>`
}

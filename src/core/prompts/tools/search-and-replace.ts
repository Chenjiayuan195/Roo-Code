import { ToolArgs } from "./types"

export function getSearchAndReplaceDescription(args: ToolArgs): string {
	return `## search_and_replace
描述: 请求对文件执行搜索和替换操作。每个操作可以指定一个搜索模式（字符串或正则表达式）和替换文本，并带有可选的行范围限制和正则表达式标志。在应用更改之前显示一个差异预览。
参数:
- path: (required) 要修改的文件的路径（相对于当前工作目录 ${args.cwd.toPosix()})
- operations: (required) 一个JSON数组，包含搜索/替换操作。每个操作是一个对象，具有以下属性：
    * search: (required) 要搜索的文本或模式
    * replace: (required) 要替换匹配项的文本。如果需要替换多行，请使用"\n"表示换行符
    * start_line: (optional) 限制替换的开始行号
    * end_line: (optional) 限制替换的结束行号
    * use_regex: (optional) 是否将搜索视为正则表达式模式
    * ignore_case: (optional) 是否在匹配时忽略大小写
    * regex_flags: (optional) 当use_regex为true时，附加的正则表达式标志
使用:
<search_and_replace>
<path>文件路径</path>
<operations>[
  {
    "search": "text to find",
    "replace": "replacement text",
    "start_line": 1,
    "end_line": 10
  }
]</operations>
</search_and_replace>
示例: 将"foo"替换为"bar"在example.ts的第1行到第10行
<search_and_replace>
<path>example.ts</path>
<operations>[
  {
    "search": "foo",
    "replace": "bar",
    "start_line": 1,
    "end_line": 10
  }
]</operations>
</search_and_replace>
示例: 使用正则表达式将所有"old"替换为"new"
<search_and_replace>
<path>example.ts</path>
<operations>[
  {
    "search": "old\\w+",
    "replace": "new$&",
    "use_regex": true,
    "ignore_case": true
  }
]</operations>
</search_and_replace>`
}

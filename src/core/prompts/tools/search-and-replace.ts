import { ToolArgs } from "./types"

export function getSearchAndReplaceDescription(args: ToolArgs): string {
	return `## search_and_replace
描述：请求对文件执行搜索和替换操作。每个操作可以指定搜索模式（字符串或正则表达式）和替换文本，还可以选择行范围限制和正则表达式标志。在应用更改前显示差异预览。
参数：
- path：（必需）要修改的文件路径（相对于当前工作目录${args.cwd.toPosix()}）
- operations：（必需）搜索/替换操作的JSON数组。每个操作是一个具有以下属性的对象：
    * search：（必需）要搜索的文本或模式
    * replace：（必需）用于替换匹配项的文本。如果需要替换多行，请使用"\n"表示换行
    * start_line：（可选）限制替换的起始行号
    * end_line：（可选）限制替换的结束行号
    * use_regex：（可选）是否将搜索视为正则表达式模式
    * ignore_case：（可选）匹配时是否忽略大小写
    * regex_flags：（可选）当use_regex为true时的附加正则表达式标志
用法：
<search_and_replace>
<path>文件路径</path>
<operations>[
  {
    "search": "要查找的文本",
    "replace": "替换文本",
    "start_line": 1,
    "end_line": 10
  }
]</operations>
</search_and_replace>
示例：在example.ts的1-10行中将"foo"替换为"bar"
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
示例：使用正则表达式替换所有"old"的出现
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

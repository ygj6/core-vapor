import type { CodegenContext } from '../generate'
import { DynamicFlag, type IRDynamicInfo } from '../ir'
import { NEWLINE, buildCodeFragment, genCall } from './utils'

export function genTemplates(
  templates: string[],
  { vaporHelper }: CodegenContext,
) {
  return templates
    .map(
      (template, i) =>
        `const t${i} = ${vaporHelper('template')}(${JSON.stringify(template)})\n`,
    )
    .join('')
}

export function genChildren(
  dynamic: IRDynamicInfo,
  context: CodegenContext,
  from: number,
  paths: number[] = [],
) {
  const { vaporHelper } = context
  const [frag, push] = buildCodeFragment()
  let offset = 0
  const { children } = dynamic

  for (const [index, child] of children.entries()) {
    if (child.flags & DynamicFlag.NON_TEMPLATE) {
      offset--
    }

    const elementIndex = Number(index) + offset
    const id =
      child.flags & DynamicFlag.REFERENCED
        ? child.flags & DynamicFlag.INSERT
          ? child.anchor
          : child.id
        : null

    const newPaths = [...paths, elementIndex]

    if (id !== null) {
      push(
        NEWLINE,
        `const n${id} = `,
        ...genCall(
          vaporHelper('children'),
          `n${from}`,
          ...newPaths.map(String),
        ),
      )
      push(...genChildren(child, context, id, []))
    } else {
      push(...genChildren(child, context, from, newPaths))
    }
  }

  return frag
}

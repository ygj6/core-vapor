import type {
  BindingTypes,
  CompoundExpressionNode,
  DirectiveNode,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
} from '@vue/compiler-dom'
import type { Prettify } from '@vue/shared'
import type {
  DirectiveTransform,
  DirectiveTransformResult,
  NodeTransform,
} from './transform'

export enum IRNodeTypes {
  ROOT,
  BLOCK,

  SET_PROP,
  SET_DYNAMIC_PROPS,
  SET_TEXT,
  SET_EVENT,
  SET_HTML,
  SET_REF,
  SET_MODEL_VALUE,

  INSERT_NODE,
  PREPEND_NODE,
  APPEND_NODE,
  CREATE_TEXT_NODE,

  WITH_DIRECTIVE,

  IF,
  FOR,
}

export interface BaseIRNode {
  type: IRNodeTypes
}

export type VaporHelper = keyof typeof import('@vue/runtime-vapor')

export interface BlockIRNode extends BaseIRNode {
  type: IRNodeTypes.BLOCK
  node: RootNode | TemplateChildNode
  templateIndex: number
  dynamic: IRDynamicInfo
  effect: IREffect[]
  operation: OperationNode[]
  returns: number[]
}

export interface RootIRNode {
  type: IRNodeTypes.ROOT
  node: RootNode
  source: string
  template: string[]
  block: BlockIRNode
}

export interface IfIRNode extends BaseIRNode {
  type: IRNodeTypes.IF
  id: number
  condition: SimpleExpressionNode
  positive: BlockIRNode
  negative?: BlockIRNode | IfIRNode
}

export interface ForIRNode extends BaseIRNode {
  type: IRNodeTypes.FOR
  id: number
  source: SimpleExpressionNode
  value?: SimpleExpressionNode
  key?: SimpleExpressionNode
  index?: SimpleExpressionNode
  keyProperty?: SimpleExpressionNode
  render: BlockIRNode
}

export interface IRProp extends Omit<DirectiveTransformResult, 'value'> {
  values: SimpleExpressionNode[]
}
export type IRProps = IRProp[] | SimpleExpressionNode

export interface SetPropIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_PROP
  element: number
  prop: IRProp
}

export interface SetDynamicPropsIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_DYNAMIC_PROPS
  element: number
  props: IRProps[]
}

export interface SetTextIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_TEXT
  element: number
  values: SimpleExpressionNode[]
}

export type KeyOverride = [find: string, replacement: string]
export interface SetEventIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_EVENT
  element: number
  key: SimpleExpressionNode
  value?: SimpleExpressionNode
  modifiers: {
    // modifiers for addEventListener() options, e.g. .passive & .capture
    options: string[]
    // modifiers that needs runtime guards, withKeys
    keys: string[]
    // modifiers that needs runtime guards, withModifiers
    nonKeys: string[]
  }
  keyOverride?: KeyOverride
}

export interface SetHtmlIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_HTML
  element: number
  value: SimpleExpressionNode
}

export interface SetRefIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_REF
  element: number
  value: SimpleExpressionNode
}

export interface SetModelValueIRNode extends BaseIRNode {
  type: IRNodeTypes.SET_MODEL_VALUE
  element: number
  key: SimpleExpressionNode
  value: SimpleExpressionNode
  bindingType?: BindingTypes
  isComponent: boolean
}

export interface CreateTextNodeIRNode extends BaseIRNode {
  type: IRNodeTypes.CREATE_TEXT_NODE
  id: number
}

export interface InsertNodeIRNode extends BaseIRNode {
  type: IRNodeTypes.INSERT_NODE
  element: number | number[]
  parent: number
  anchor: number
}

export interface PrependNodeIRNode extends BaseIRNode {
  type: IRNodeTypes.PREPEND_NODE
  elements: number[]
  parent: number
}

export interface AppendNodeIRNode extends BaseIRNode {
  type: IRNodeTypes.APPEND_NODE
  elements: number[]
  parent: number
}

export interface WithDirectiveIRNode extends BaseIRNode {
  type: IRNodeTypes.WITH_DIRECTIVE
  element: number
  dir: VaporDirectiveNode
  builtin?: VaporHelper
}

export type IRNode = OperationNode | RootIRNode
export type OperationNode =
  | SetPropIRNode
  | SetDynamicPropsIRNode
  | SetTextIRNode
  | SetEventIRNode
  | SetHtmlIRNode
  | SetRefIRNode
  | SetModelValueIRNode
  | CreateTextNodeIRNode
  | InsertNodeIRNode
  | PrependNodeIRNode
  | AppendNodeIRNode
  | WithDirectiveIRNode
  | IfIRNode
  | ForIRNode

export enum DynamicFlag {
  NONE = 0,
  /**
   * This node is referenced and needs to be saved as a variable.
   */
  REFERENCED = 1,
  /**
   * This node is not generated from template, but is generated dynamically.
   */
  NON_TEMPLATE = 1 << 1,
  /**
   * This node needs to be inserted back into the template.
   */
  INSERT = 1 << 2,
}

export interface IRDynamicInfo {
  id: number | null
  flags: DynamicFlag
  anchor: number | null
  children: IRDynamicInfo[]
}

export interface IREffect {
  expressions: SimpleExpressionNode[]
  operations: OperationNode[]
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> &
  Pick<U, Extract<keyof U, keyof T>>

export type HackOptions<T> = Prettify<
  Overwrite<
    T,
    {
      nodeTransforms?: NodeTransform[]
      directiveTransforms?: Record<string, DirectiveTransform | undefined>
    }
  >
>

export type VaporDirectiveNode = Overwrite<
  DirectiveNode,
  {
    exp: Exclude<DirectiveNode['exp'], CompoundExpressionNode>
    arg: Exclude<DirectiveNode['arg'], CompoundExpressionNode>
  }
>

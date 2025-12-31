/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType, ComponentProps } from 'react'

  const MDXComponent: ComponentType<ComponentProps<'div'>>
  export default MDXComponent
}

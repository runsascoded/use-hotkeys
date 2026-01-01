import { useEffect, useState } from 'react'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { transformerNotationDiff, transformerMetaHighlight } from '@shikijs/transformers'
import { useTheme } from '../contexts/ThemeContext'

interface CodeBlockProps {
  code: string
  lang?: string
  /** Line numbers or ranges to highlight, e.g. "1-2,6-8" */
  highlightLines?: string
}

// Lazy-loaded highlighter singleton
let highlighterPromise: Promise<HighlighterCore> | null = null

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('shiki/themes/github-dark.mjs'),
        import('shiki/themes/github-light.mjs'),
      ],
      langs: [
        import('shiki/langs/tsx.mjs'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    })
  }
  return highlighterPromise
}

export function CodeBlock({ code, lang = 'tsx', highlightLines }: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    getHighlighter().then(highlighter => {
      const result = highlighter.codeToHtml(code.trim(), {
        lang,
        theme: resolvedTheme === 'dark' ? 'github-dark' : 'github-light',
        meta: highlightLines ? { __raw: `{${highlightLines}}` } : undefined,
        transformers: [transformerNotationDiff(), transformerMetaHighlight()],
      })
      setHtml(result)
    })
  }, [code, lang, resolvedTheme, highlightLines])

  if (!html) {
    return (
      <pre className="code-block-loading">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="code-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

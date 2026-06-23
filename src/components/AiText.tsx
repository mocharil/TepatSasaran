import React from 'react'

function boldify(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
  )
}

export default function AiText({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let listBuf: React.ReactNode[] = []
  let listType: 'ul' | 'ol' | null = null

  function flushList() {
    if (!listBuf.length) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    nodes.push(
      <Tag key={nodes.length} className={`ml-4 space-y-0.5 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {listBuf}
      </Tag>
    )
    listBuf = []
    listType = null
  }

  lines.forEach((raw, i) => {
    const line = raw.trimEnd()

    // Headers
    const hMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (hMatch) {
      flushList()
      const level = hMatch[1].length
      const cls = level === 1
        ? 'text-base font-bold text-purple-800 mt-4 mb-1'
        : level === 2
          ? 'text-sm font-bold text-purple-700 mt-3 mb-0.5'
          : 'text-sm font-semibold text-gray-800 mt-2'
      nodes.push(<p key={i} className={cls}>{boldify(hMatch[2])}</p>)
      return
    }

    // Unordered list
    const ulMatch = line.match(/^[-*]\s+(.+)/)
    if (ulMatch) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listBuf.push(<li key={listBuf.length} className="text-sm text-gray-800">{boldify(ulMatch[1])}</li>)
      return
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listBuf.push(<li key={listBuf.length} className="text-sm text-gray-800">{boldify(olMatch[1])}</li>)
      return
    }

    flushList()

    if (line === '') {
      nodes.push(<div key={i} className="h-2" />)
      return
    }

    // Horizontal rule
    if (/^---+$/.test(line)) {
      nodes.push(<hr key={i} className="border-purple-100 my-2" />)
      return
    }

    nodes.push(<p key={i} className="text-sm text-gray-800 leading-relaxed">{boldify(line)}</p>)
  })

  flushList()

  return <div className="space-y-0.5">{nodes}</div>
}

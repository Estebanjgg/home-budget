interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    // Convertir títulos H2 y H3
    text = text.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h3>')
    text = text.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
    
    // Convertir texto en negrita y cursiva
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    text = text.replace(/\*(.+?)\*/g, '<em class="italic text-gray-700">$1</em>')
    
    // Convertir bloques de código
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="font-mono text-sm">$1</code></pre>')
    
    // Convertir código inline
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
    
    // Convertir enlaces
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Convertir citas
    text = text.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">$1</blockquote>')
    
    // Convertir separadores
    text = text.replace(/^---$/gm, '<hr class="border-t border-gray-300 my-6">')
    
    // Convertir tablas
    text = text.replace(/\|(.+)\|\n\|(-+\|)+\n((?:\|.+\|\n?)+)/g, (match, header, separator, rows) => {
      const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
      const headerRow = headerCells.map((cell: string) => `<th class="px-4 py-2 bg-gray-100 font-semibold text-gray-800 border border-gray-300">${cell}</th>`).join('')
      
      const bodyRows = rows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
        const rowCells = cells.map((cell: string) => `<td class="px-4 py-2 border border-gray-300 text-gray-700">${cell}</td>`).join('')
        return `<tr>${rowCells}</tr>`
      }).join('')
      
      return `<table class="w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`
    })
    
    // Convertir listas numeradas
    text = text.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><span class="font-medium text-blue-600">$1.</span> $2</li>')
    
    // Convertir listas con viñetas
    text = text.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1"><span class="text-blue-600 font-bold">•</span> $1</li>')
    
    // Agrupar listas consecutivas
    text = text.replace(/(<li[^>]*>[\s\S]*?<\/li>\s*)+/g, (match) => {
      if (match.includes('span class="font-medium text-blue-600"')) {
        return `<ol class="list-none space-y-1 mb-4">${match}</ol>`
      } else {
        return `<ul class="list-none space-y-1 mb-4">${match}</ul>`
      }
    })
    
    // Convertir saltos de línea a párrafos
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    return paragraphs.map(p => {
      if (p.includes('<h2') || p.includes('<h3') || p.includes('<ul') || p.includes('<ol') || p.includes('<blockquote') || p.includes('<hr')) {
        return p
      }
      return `<p class="mb-4 text-gray-700 leading-relaxed">${p}</p>`
    }).join('')
  }

  const processedContent = renderMarkdown(content)
  
  const finalContent = processedContent

  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: finalContent }}
    />
  )
}
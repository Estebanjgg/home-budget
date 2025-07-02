import { useState } from 'react'
import type { EducationalContent } from '@/lib/types'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ArticleViewerProps {
  article: EducationalContent
  onClose: () => void
}

export function ArticleViewer({ article, onClose }: ArticleViewerProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-500 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{article.image_emoji}</span>
              <div>
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-white bg-opacity-90 text-blue-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    📄 Artículo
                  </span>
                  <span className="bg-white bg-opacity-90 text-purple-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {article.category}
                  </span>
                  <span className="bg-white bg-opacity-90 text-gray-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    ⏱️ {article.duration}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-gray-900 rounded-full p-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Article Image */}
          {article.image_url && (
            <div className="p-6 border-b border-gray-200">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Summary */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Resumen
            </h3>
            <p className="text-gray-700 leading-relaxed">{article.summary}</p>
          </div>

          {/* Article Content */}
          <div className="p-6">
            {article.content ? (
              <div className="prose prose-lg max-w-none">
                <MarkdownRenderer content={article.content} />
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📄</span>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Contenido no disponible</h4>
                <p className="text-gray-600 mb-6">
                  El contenido completo de este artículo no está disponible en este momento.
                </p>
                {article.url && (
                  <button
                    onClick={() => window.open(article.url, '_blank')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    🔗 Ver artículo completo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>📅 {new Date(article.created_at).toLocaleDateString('es-ES')}</span>
              <span>👁️ Artículo educativo</span>
            </div>
            <div className="flex items-center space-x-3">
              {article.url && (
                <button
                  onClick={() => window.open(article.url, '_blank')}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-all duration-200"
                >
                  🔗 Fuente original
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
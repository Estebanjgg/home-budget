import { useState } from 'react'
import { useEducationalContent } from '@/hooks/useEducationalContent'
import type { EducationalContent } from '@/lib/types'
// CORREÇÃO: O componente VideoPlayer precisa ser importado. 
// Substitua './VideoPlayer' pelo caminho correto do seu arquivo.
import { VideoPlayer } from './VideoPlayer' 

interface EducationAdminProps {
  onClose: () => void
}

export function EducationAdmin({ onClose }: EducationAdminProps) {
  const { content, addContent, editContent, removeContent, loading } = useEducationalContent()
  const [showForm, setShowForm] = useState(false)
  const [editingContent, setEditingContent] = useState<EducationalContent | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    type: 'article' as 'article' | 'video',
    category: '',
    duration: '',
    image_emoji: '📄',
    url: '',
    is_featured: false,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingContent) {
        await editContent(editingContent.id, formData)
      } else {
        await addContent(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      type: 'article',
      category: '',
      duration: '',
      image_emoji: '📄',
      url: '',
      is_featured: false,
      is_active: true
    })
    setEditingContent(null)
    setShowForm(false)
  }

  const handleEdit = (content: EducationalContent) => {
    setFormData({
      title: content.title,
      summary: content.summary,
      content: content.content || '',
      type: content.type,
      category: content.category,
      duration: content.duration,
      image_emoji: content.image_emoji,
      url: content.url || '',
      is_featured: content.is_featured,
      is_active: content.is_active
    })
    setEditingContent(content)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      await removeContent(id)
    }
  }

  const handlePreviewVideo = () => {
    if (formData.url && formData.type === 'video') {
      setPreviewVideo(formData.url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center">
              <span className="text-4xl mr-3">👨‍💼</span>
              Panel de Administración - Centro Educativo
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showForm ? (
            // CORREÇÃO: Adicionado React.Fragment (<>) para envolver os múltiplos elementos.
            <>
              {/* Lista de contenido con filtros mejorados */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-bold text-gray-800">Gestionar Contenido Educativo</h3>
                  <div className="flex space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      📄 {content.filter(c => c.type === 'article').length} Artículos
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      🎥 {content.filter(c => c.type === 'video').length} Videos
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ {content.filter(c => c.is_featured).length} Destacados
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center"
                >
                  <span className="text-xl mr-2">➕</span>
                  Nuevo Contenido
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{item.image_emoji}</span>
                      <div className="flex space-x-2">
                        {item.is_featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs font-medium">
                            ⭐ Destacado
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          item.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type === 'video' ? '📹 Video' : '📄 Artículo'}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {item.title}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.duration}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Ahorro">Ahorro</option>
                      <option value="Presupuesto">Presupuesto</option>
                      <option value="Inversión">Inversión</option>
                      <option value="Emergencias">Emergencias</option>
                      <option value="Deudas">Deudas</option>
                      <option value="Planificación">Planificación</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'article' | 'video' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="article">📄 Artículo</option>
                      <option value="video">📹 Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="ej: 5 min, 12 min"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.image_emoji}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_emoji: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* CORREÇÃO: Envolvido o conteúdo condicional em um React.Fragment. */}
                  {formData.type === 'video' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL del Video *
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={handlePreviewVideo}
                            className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                          >
                            👁️ Vista Previa
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Soporta YouTube, Vimeo y videos directos (.mp4, .webm, .ogg)
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duración del Video *
                        </label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="ej: 5:30, 12 min, 1h 15min"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumen *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido Completo
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contenido detallado del artículo o descripción del video..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">⭐ Contenido destacado</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">✅ Activo</span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (editingContent ? 'Actualizar' : 'Crear')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {previewVideo && (
        <VideoPlayer
          url={previewVideo}
          title="Vista Previa del Video"
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  )
}
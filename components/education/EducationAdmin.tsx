import { useState } from 'react'
import { useEducationalContent } from '@/hooks/useEducationalContent'
import { EducationalContent } from '@/lib/types'
import { MarkdownRenderer } from './MarkdownRenderer'
import { VideoPlayer } from './VideoPlayer'
import { supabase } from '@/lib/config/supabase' 

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
    image_url: '',
    url: '',
    is_featured: false,
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let finalFormData = { ...formData }
      
      // Si hay una imagen nueva para subir
      if (imageFile) {
        setUploadingImage(true)
        try {
          const imageUrl = await uploadImage(imageFile)
          finalFormData.image_url = imageUrl
        } catch (error) {
          console.error('Error uploading image:', error)
          alert('Error al subir la imagen. Inténtalo de nuevo.')
          return
        } finally {
          setUploadingImage(false)
        }
      }
      
      if (editingContent) {
        await editContent(editingContent.id, finalFormData)
      } else {
        await addContent(finalFormData)
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
      image_url: '',
      url: '',
      is_featured: false,
      is_active: true
    })
    setImageFile(null)
    setImagePreview('')
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
      image_url: content.image_url || '',
      url: content.url || '',
      is_featured: content.is_featured,
      is_active: content.is_active
    })
    setImagePreview(content.image_url || '')
    setEditingContent(content)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      try {
        // Buscar el contenido para obtener la URL de la imagen
        const contentToDelete = content.find(c => c.id === id)
        
        // Eliminar el contenido de la base de datos
        await removeContent(id)
        
        // Si tenía imagen, eliminarla del storage
        if (contentToDelete?.image_url) {
          await deleteImageFromStorage(contentToDelete.image_url)
        }
      } catch (error) {
        console.error('Error deleting content:', error)
        alert('Error al eliminar el contenido')
      }
    }
  }

  const handlePreviewVideo = () => {
    if (formData.url && formData.type === 'video') {
      setPreviewVideo(formData.url)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        return
      }
      
      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `education-images/${fileName}`

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('education-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading to Supabase Storage:', error)
        throw new Error('Error al subir la imagen')
      }

      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('education-content')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadImage:', error)
      throw error
    }
  }

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      if (imageUrl && imageUrl.includes('education-content')) {
        // Extraer el path del archivo de la URL
        const urlParts = imageUrl.split('/education-content/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          
          const { error } = await supabase.storage
            .from('education-content')
            .remove([filePath])
          
          if (error) {
            console.error('Error deleting image from storage:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error in deleteImageFromStorage:', error)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-500 w-full max-w-6xl max-h-[90vh] overflow-hidden">
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

                  {formData.type === 'article' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen del Artículo
                      </label>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-xl border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                              <div className="text-4xl text-gray-400">📷</div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                  Haz clic para subir
                                </span>
                                {' '}o arrastra una imagen aquí
                              </div>
                              <div className="text-xs text-gray-500">
                                PNG, JPG, GIF hasta 5MB
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    {/* Barra de herramientas de formato */}
                    <div className="bg-gray-50 border-b border-gray-300 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const end = textarea.selectionEnd
                               const selectedText = textarea.value.substring(start, end)
                               const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Negrita"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.674zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.908z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const end = textarea.selectionEnd
                               const selectedText = textarea.value.substring(start, end)
                               const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Cursiva"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n## ' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Título H2"
                           >
                             <span className="text-xs font-bold">H2</span>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n### ' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Título H3"
                           >
                             <span className="text-xs font-bold">H3</span>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n- ' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Lista con viñetas"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n1. ' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Lista numerada"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path fillRule="evenodd" d="M2.003 2.5a.5.5 0 0 0-.723-.447l-1.003.5a.5.5 0 0 0 .446.895l.28-.14V6H.5a.5.5 0 0 0 0 1h2.006a.5.5 0 1 0 0-1h-.503V2.5zM1.094 8.5a.5.5 0 0 1 .906 0L2.5 9.94 3 8.5a.5.5 0 0 1 .906 0l.5 1.5a.5.5 0 0 1-.453.707H1.047A.5.5 0 0 1 .594 10L1.094 8.5zM3.5 13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h1.797l-.896-.447a.5.5 0 0 1 .446-.895l1.5.75a.5.5 0 0 1-.347.092zM5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const end = textarea.selectionEnd
                               const selectedText = textarea.value.substring(start, end) || 'enlace'
                               const newText = textarea.value.substring(0, start) + `[${selectedText}](url)` + textarea.value.substring(end)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Enlace"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 9.5a2 2 0 1 1-4 0 2 2 0 0 1 1.732-1.732A2 2 0 0 1 6.354 5.5zm2.292 1A3 3 0 0 0 12 9.5a3 3 0 0 0 0-6h-3a3 3 0 0 0-2.83 4h.83c.086 0 .17-.01.25-.031A2 2 0 0 1 9 6.5a2 2 0 1 1 4 0 2 2 0 0 1-1.732 1.732A2 2 0 0 1 8.646 6.5z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const end = textarea.selectionEnd
                               const selectedText = textarea.value.substring(start, end)
                               const newText = textarea.value.substring(0, start) + `\`${selectedText}\`` + textarea.value.substring(end)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Código inline"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/>
                             </svg>
                           </button>
                          <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n> ' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Cita"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const newText = textarea.value.substring(0, start) + '\n---\n' + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Separador"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M12 15H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                               <path d="M4 8h8v1H4z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const codeBlock = '\n```\n// Tu código aquí\n```\n'
                               const newText = textarea.value.substring(0, start) + codeBlock + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Bloque de código"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                               <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
                             </svg>
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
                               const start = textarea.selectionStart
                               const table = '\n| Columna 1 | Columna 2 | Columna 3 |\n|-----------|-----------|-----------|\n| Dato 1    | Dato 2    | Dato 3    |\n| Dato 4    | Dato 5    | Dato 6    |\n'
                               const newText = textarea.value.substring(0, start) + table + textarea.value.substring(start)
                               setFormData(prev => ({ ...prev, content: newText }))
                             }}
                             className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                             title="Tabla"
                           >
                             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                               <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/>
                             </svg>
                           </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPreview(!showPreview)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            showPreview 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {showPreview ? '✏️ Editor' : '👁️ Vista Previa'}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        💡 Markdown: **negrita**, *cursiva*, ## títulos, - listas, [enlaces](url), `código`, {'>'} citas
                      </div>
                    </div>
                    {showPreview ? (
                      <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
                        {formData.content.trim() ? (
                          <div className="px-4 py-3">
                            <MarkdownRenderer content={formData.content} />
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-gray-500 italic">
                            Escribe contenido en el editor para ver la vista previa aquí...
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        id="content-editor"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={15}
                        className="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        placeholder={`Contenido detallado del ${formData.type === 'article' ? 'artículo' : 'video'}...\n\nPuedes usar Markdown para formato:\n\n## Título Principal\nEste es un párrafo con **texto en negrita** y *texto en cursiva*.\n\n### Subtítulo\nPuedes crear listas:\n- Elemento 1\n- Elemento 2\n- Elemento 3\n\nO listas numeradas:\n1. Primer paso\n2. Segundo paso\n3. Tercer paso\n\n> Esta es una cita importante\n\nTambién puedes añadir [enlaces](https://ejemplo.com) y \`código inline\`.\n\n---\n\n**Consejos:**\n- Usa títulos para organizar el contenido\n- Las listas ayudan a la legibilidad\n- Las citas destacan información importante`}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Tip: Selecciona texto y usa los botones de formato, o escribe Markdown directamente
                  </div>
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
                    disabled={loading || uploadingImage}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                  >
                    {uploadingImage ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo imagen...
                      </>
                    ) : loading ? (
                      'Guardando...'
                    ) : (
                      editingContent ? 'Actualizar' : 'Crear'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading || uploadingImage}
                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
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
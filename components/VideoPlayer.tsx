import { useState } from 'react'

interface VideoPlayerProps {
  url: string
  title: string
  onClose: () => void
}

export function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Función para convertir URLs de video a formato embebido
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    
    // Si es una URL directa de video
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return url
    }
    
    return url
  }

  const embedUrl = getEmbedUrl(url)
  const isDirectVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <span className="text-2xl mr-3">🎥</span>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="relative bg-black" style={{ paddingBottom: '56.25%', height: 0 }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Cargando video...</p>
              </div>
            </div>
          )}
          
          {isDirectVideo ? (
            <video
              className="absolute top-0 left-0 w-full h-full"
              controls
              autoPlay
              onLoadStart={() => setIsLoading(false)}
            >
              <source src={embedUrl} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            ></iframe>
          )}
        </div>
        
        <div className="p-4 bg-gray-50">
          <p className="text-gray-600 text-sm">
            💡 <strong>Tip:</strong> Puedes usar el modo pantalla completa para una mejor experiencia de visualización.
          </p>
        </div>
      </div>
    </div>
  )
}
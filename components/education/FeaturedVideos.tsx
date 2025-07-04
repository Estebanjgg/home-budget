import { useState } from 'react'
import { LazyVideoPlayer } from '../LazyComponents'
import type { EducationalContent } from '@/lib/types'

interface FeaturedVideosProps {
  featuredContent: EducationalContent[]
}

export function FeaturedVideos({ featuredContent }: FeaturedVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<EducationalContent | null>(null)

  const handleVideoClick = (video: EducationalContent) => {
    if (video.url) {
      setSelectedVideo(video)
    }
  }

  const videoContent = featuredContent.filter(content => content.type === 'video')

  if (videoContent.length === 0) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200 text-center">
        <span className="text-6xl mb-4 block">🎬</span>
        <h4 className="text-xl font-bold text-gray-800 mb-2">No hay videos destacados</h4>
        <p className="text-gray-600">Los videos destacados aparecerán aquí cuando estén disponibles.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">🎥</span>
          Videos Educativos Destacados
          <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {videoContent.length} videos
          </span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoContent.map((video) => (
            <div key={video.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
              <div className="relative mb-4">
                {video.image_url ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={video.image_url} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                    <div className="hidden bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-6 text-center relative overflow-hidden h-40 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <span className="text-4xl text-white relative z-10">{video.image_emoji || '▶️'}</span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <span className="text-4xl text-white relative z-10">{video.image_emoji || '▶️'}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h5 className="font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h5>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{video.summary || 'Video educativo disponible para mejorar tus conocimientos financieros.'}</p>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    video.category === 'Ahorro' ? 'bg-green-100 text-green-700' :
                    video.category === 'Presupuesto' ? 'bg-blue-100 text-blue-700' :
                    video.category === 'Inversión' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {video.category}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {video.duration}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleVideoClick(video)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Ver Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedVideo && (
        <LazyVideoPlayer
          url={selectedVideo.url!}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  )
}
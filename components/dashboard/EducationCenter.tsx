import React, { useState } from 'react'
import Link from 'next/link'
import { FeaturedVideos } from './../education/FeaturedVideos'
import type { EducationalContent } from '@/lib/types'

interface DashboardMetrics {
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  savingsRate: number
  expenseRatio: number
}

interface GroceryMetrics {
  totalSpent: number
  percentageOfIncome: number
  efficiency: number
}



interface Article {
  title: string
  description: string
  readTime: string
  category: string
  priority: 'high' | 'medium' | 'low'
  icon: string
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple'
}

interface Video {
  title: string
  description: string
  duration: string
  category: string
  priority: 'high' | 'medium' | 'low'
  icon: string
  color: 'blue' | 'orange' | 'green'
}

interface PersonalizedContent {
  articles: Article[]
  videos: Video[]
  tips: string[]
}

interface Tab {
  id: string
  label: string
  icon: string
  count: number
}

interface EducationCenterProps {
  dashboardMetrics: DashboardMetrics
  groceryMetrics: GroceryMetrics
  formatCurrency: (amount: number) => string
  educationalContent: EducationalContent[]
  featuredContent: EducationalContent[]
  handleContentClick: (content: EducationalContent) => void
}

export function EducationCenter({ 
  dashboardMetrics, 
  groceryMetrics, 
  formatCurrency, 
  educationalContent, 
  featuredContent, 
  handleContentClick 
}: EducationCenterProps) {
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'tips'>('articles')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'mosaic' | 'normal' | 'list'>('normal')
  
  // Contenido educativo personalizado basado en métricas
  const getPersonalizedContent = (): PersonalizedContent => {
    const content: PersonalizedContent = {
      articles: [],
      videos: [],
      tips: []
    }
    
    // Artículos personalizados
    if (dashboardMetrics.savingsRate < 10) {
      content.articles.push({
        title: 'Cómo Empezar a Ahorrar con Poco Dinero',
        description: 'Estrategias prácticas para comenzar tu hábito de ahorro, incluso con ingresos limitados.',
        readTime: '5 min',
        category: 'Ahorro',
        priority: 'high' as const,
        icon: '💰',
        color: 'blue' as const
      })
    }
    
    if (groceryMetrics.percentageOfIncome > 25) {
      content.articles.push({
        title: 'Reducir Gastos de Alimentación sin Sacrificar Calidad',
        description: 'Técnicas para optimizar tu presupuesto de supermercado manteniendo una alimentación saludable.',
        readTime: '7 min',
        category: 'Supermercado',
        priority: 'high' as const,
        icon: '🛒',
        color: 'orange' as const
      })
    }
    
    if (dashboardMetrics.expenseRatio > 85) {
      content.articles.push({
        title: 'Control de Gastos: Método 50/30/20',
        description: 'Aprende a distribuir tus ingresos de manera inteligente para lograr estabilidad financiera.',
        readTime: '6 min',
        category: 'Presupuesto',
        priority: 'high' as const,
        icon: '📊',
        color: 'red' as const
      })
    }
    
    // Artículos generales
    content.articles.push(
      {
        title: 'Planificación Financiera Familiar',
        description: 'Guía completa para organizar las finanzas del hogar y alcanzar metas familiares.',
        readTime: '10 min',
        category: 'Planificación',
        priority: 'medium' as const,
        icon: '👨‍👩‍👧‍👦',
        color: 'green' as const
      },
      {
        title: 'Inversiones Básicas para Principiantes',
        description: 'Conceptos fundamentales sobre inversión y cómo hacer crecer tu dinero.',
        readTime: '8 min',
        category: 'Inversión',
        priority: 'low' as const,
        icon: '📈',
        color: 'purple' as const
      }
    )
    
    // Videos personalizados
    if (groceryMetrics.efficiency < 15) {
      content.videos.push({
        title: 'Técnicas de Compra Inteligente',
        description: 'Video tutorial sobre cómo planificar y ejecutar compras eficientes.',
        duration: '12 min',
        category: 'Supermercado',
        priority: 'high' as const,
        icon: '🎥',
        color: 'orange' as const
      })
    }
    
    content.videos.push(
      {
        title: 'Presupuesto Familiar en 10 Pasos',
        description: 'Tutorial paso a paso para crear y mantener un presupuesto familiar efectivo.',
        duration: '15 min',
        category: 'Presupuesto',
        priority: 'medium' as const,
        icon: '🎬',
        color: 'blue' as const
      },
      {
        title: 'Ahorro Automático: Configura tu Futuro',
        description: 'Aprende a automatizar tus ahorros para alcanzar tus metas sin esfuerzo.',
        duration: '8 min',
        category: 'Ahorro',
        priority: 'medium' as const,
        icon: '🤖',
        color: 'green' as const
      }
    )
    
    // Tips personalizados
    if (dashboardMetrics.savingsRate < 15) {
      content.tips.push('💡 Aplica la regla del "paga primero a ti mismo": ahorra antes de gastar')
    }
    
    if (groceryMetrics.percentageOfIncome > 20) {
      content.tips.push('🛒 Planifica menús semanales para reducir compras impulsivas')
    }
    
    content.tips.push(
      '📱 Usa apps de comparación de precios antes de comprar',
      '🎯 Establece metas financieras específicas y medibles',
      '📊 Revisa tus gastos semanalmente para mantener el control',
      '💳 Evita las deudas de tarjetas de crédito con intereses altos'
    )
    
    return content
  }
  
  const content = getPersonalizedContent()
  
  // Filtrar contenido de la base de datos por tipo
  const articles = educationalContent.filter(item => item.type === 'article')
  const videos = educationalContent.filter(item => item.type === 'video')
  
  const tabs: Tab[] = [
    { id: 'articles', label: 'Artículos', icon: '📚', count: articles.length },
    { id: 'videos', label: 'Videos', icon: '🎥', count: videos.length },
    { id: 'tips', label: 'Consejos', icon: '💡', count: content.tips.length }
  ]
  
  // Funciones de paginación
  const getCurrentArticles = (): EducationalContent[] => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return articles.slice(startIndex, endIndex)
  }
  
  const getCurrentVideos = (): EducationalContent[] => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return videos.slice(startIndex, endIndex)
  }
  
  const getCurrentTips = (): string[] => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return content.tips.slice(startIndex, endIndex)
  }
  
  const getTotalPages = () => {
    const totalItems = activeTab === 'articles' ? articles.length : 
                      activeTab === 'videos' ? videos.length : 
                      content.tips.length
    return Math.ceil(totalItems / itemsPerPage)
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  // Controles de paginación
  const renderPagination = () => {
    const totalPages = getTotalPages()
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-purple-500 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
        <span className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
          🎓
        </span>
        <span className="text-base sm:text-xl lg:text-3xl">Centro de Educación Financiera</span>
      </h3>
      
      {/* Videos Educativos Destacados */}
      <div className="mb-8">
        <FeaturedVideos 
          featuredContent={featuredContent}
        />
      </div>

      {/* Controles de Vista y Paginación */}
      {(activeTab === 'articles' || activeTab === 'videos') && (
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
          {/* Selector de elementos por página */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Mostrar:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={60}>60</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs sm:text-sm text-gray-600">elementos</span>
          </div>
          
          {/* Selector de vista */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Vista:</span>
            <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('mosaic')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm transition-colors ${
                  viewMode === 'mosaic' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔲 <span className="hidden sm:inline">Mosaico</span>
              </button>
              <button
                onClick={() => setViewMode('normal')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm transition-colors border-l border-gray-300 ${
                  viewMode === 'normal' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 <span className="hidden sm:inline">Normal</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm transition-colors border-l border-gray-300 ${
                  viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📝 <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Estadísticas de Aprendizaje */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Nivel Financiero</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800">
                {dashboardMetrics.savingsRate >= 20 ? 'Avanzado' :
                 dashboardMetrics.savingsRate >= 10 ? 'Intermedio' : 'Principiante'}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">🏆</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-green-600 font-medium">Contenido Disponible</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800">
                {content.articles.length + content.videos.length} recursos
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">📖</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-purple-600 font-medium">Recomendaciones</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800">
                {content.articles.filter(a => a.priority === 'high').length + 
                 content.videos.filter(v => v.priority === 'high').length} prioritarias
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">⭐</span>
          </div>
        </div>
      </div>
      
      {/* Tabs de Navegación */}
      <div className="flex space-x-1 mb-6 sm:mb-8 bg-gray-100 rounded-xl sm:rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'articles' | 'videos' | 'tips')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-lg sm:text-xl">{tab.icon}</span>
            <span className="text-xs sm:text-base">{tab.label}</span>
            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
              activeTab === tab.id ? 'bg-gray-200' : 'bg-gray-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* Contenido de Artículos */}
      {activeTab === 'articles' && (
        <>
          {renderPagination()}
          <div>
          {viewMode === 'mosaic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {getCurrentArticles().map((article) => (
                <div key={article.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={() => handleContentClick(article)}>
                  <div className="mb-3">
                    {article.image_url ? (
                      <div className="relative w-full h-20 sm:h-24 mb-2 rounded-lg overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
                          <span className="text-xl sm:text-2xl text-white">{article.image_emoji || '📄'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-20 sm:h-24 mb-2 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-xl sm:text-2xl text-white">{article.image_emoji || '📄'}</span>
                      </div>
                    )}
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      📄 Artículo
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3">{article.summary}</p>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {getCurrentArticles().map((article) => (
                <div key={article.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={() => handleContentClick(article)}>
                  <div className="mb-3 sm:mb-4">
                    {article.image_url ? (
                      <div className="relative w-full h-24 sm:h-32 mb-2 sm:mb-3 rounded-lg sm:rounded-xl overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
                          <span className="text-2xl sm:text-4xl text-white">{article.image_emoji || '📄'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-24 sm:h-32 mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-2xl sm:text-4xl text-white">{article.image_emoji || '📄'}</span>
                      </div>
                    )}
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      📄 Artículo
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">{article.title}</h4>
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-4">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.duration || 'Lectura rápida'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-3 sm:space-y-4">
              {getCurrentArticles().map((article) => (
                <div key={article.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleContentClick(article)}>
                  <div className="flex-shrink-0">
                    {article.image_url ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
                        <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
                          <span className="text-lg sm:text-xl text-white">{article.image_emoji || '📄'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-lg sm:text-xl text-white">{article.image_emoji || '📄'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm sm:text-lg font-bold text-gray-800 truncate">{article.title}</h4>
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                        📄 Artículo
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{article.summary}</p>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.duration || 'Lectura rápida'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination()}
          </div>
        </>
      )}
      
      {/* Contenido de Videos */}
      {activeTab === 'videos' && (
        <>
          {renderPagination()}
          <div>
          {viewMode === 'mosaic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {getCurrentVideos().map((video) => (
                <div key={video.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={() => handleContentClick(video)}>
                  <div className="mb-3">
                    {video.image_url ? (
                      <div className="relative w-full h-20 sm:h-24 mb-2 rounded-lg overflow-hidden">
                        <img 
                          src={video.image_url} 
                          alt={video.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 items-center justify-center">
                          <span className="text-xl sm:text-2xl text-white">{video.image_emoji || '🎥'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-20 sm:h-24 mb-2 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                        <span className="text-xl sm:text-2xl text-white">{video.image_emoji || '🎥'}</span>
                      </div>
                    )}
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      🎥 Video
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3">{video.summary}</p>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {getCurrentVideos().map((video) => (
                <div key={video.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={() => handleContentClick(video)}>
                  <div className="mb-3 sm:mb-4">
                    {video.image_url ? (
                      <div className="relative w-full h-24 sm:h-32 mb-2 sm:mb-3 rounded-lg sm:rounded-xl overflow-hidden">
                        <img 
                          src={video.image_url} 
                          alt={video.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 items-center justify-center">
                          <span className="text-2xl sm:text-4xl text-white">{video.image_emoji || '🎥'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-24 sm:h-32 mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                        <span className="text-2xl sm:text-4xl text-white">{video.image_emoji || '🎥'}</span>
                      </div>
                    )}
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      🎥 Video
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">{video.title}</h4>
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-4">{video.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                      {video.category}
                    </span>
                    <span className="text-xs text-gray-500">{video.duration || 'Video corto'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-3 sm:space-y-4">
              {getCurrentVideos().map((video) => (
                <div key={video.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleContentClick(video)}>
                  <div className="flex-shrink-0">
                    {video.image_url ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
                        <img 
                          src={video.image_url} 
                          alt={video.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 items-center justify-center">
                          <span className="text-lg sm:text-xl text-white">{video.image_emoji || '🎥'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                        <span className="text-lg sm:text-xl text-white">{video.image_emoji || '🎥'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm sm:text-lg font-bold text-gray-800 truncate">{video.title}</h4>
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex-shrink-0">
                        🎥 Video
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{video.summary}</p>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                        {video.category}
                      </span>
                      <span className="text-xs text-gray-500">{video.duration || 'Video corto'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination()}
          </div>
        </>
      )}
      
      {/* Contenido de Consejos */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {getCurrentTips().map((tip, index) => (
            <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-100 transition-all duration-300 hover:shadow-lg">
              <p className="text-gray-700 font-medium text-sm sm:text-base">{tip}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Call to Action */}
      <div className="mt-6 sm:mt-8 text-center">
        <button 
          onClick={() => {
            // Cambiar a la pestaña de educación si existe, o mantener en dashboard
            const event = new CustomEvent('changeTab', { detail: 'dashboard' });
            window.dispatchEvent(event);
            // Hacer scroll hacia arriba para mostrar todo el contenido educativo
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <span className="hidden sm:inline">Explorar Todo el Contenido Educativo</span>
          <span className="sm:hidden">Explorar Contenido</span>
        </button>
      </div>
    </div>
  )
}
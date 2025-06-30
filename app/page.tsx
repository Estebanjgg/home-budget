'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Auth from '@/components/Auth'
import UserProfile from '@/components/UserProfile'
import UserMenu from '@/components/UserMenu'

export default function Home() {
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video 
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/video/Jun_30__1252_16s_202506301308_zeh4h.mp4" type="video/mp4" />
            {/* Fallback para navegadores que no soporten el video */}
          </video>
          {/* Overlay gradient for better readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl mb-6 sm:mb-8 border border-white/20">
              <img 
                src="/logo-aplicativo/logo_esteban.png" 
                alt="Home Budget Logo" 
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 py-2 sm:px-8 sm:py-4 border border-white/20 shadow-2xl mb-3 sm:mb-4 mx-auto max-w-fit">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                Home Budget
              </h1>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20 shadow-xl mx-auto max-w-fit">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-md max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl">
                Gestiona tu presupuesto familiar de manera inteligente y toma control total de tus finanzas
              </p>
            </div>
          </div>
          <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
            <Auth />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Home Budget
            </h1>
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-gray-700">Bienvenido</span>
              <UserMenu 
                user={user} 
                onProfileClick={() => setShowProfile(true)} 
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ingresos del Mes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      $0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">-</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Gastos del Mes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      $0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">=</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Balance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      $0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Próximas Funcionalidades
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Agregar ingresos y gastos</li>
                <li>• Categorizar transacciones</li>
                <li>• Reportes y gráficos</li>
                <li>• Metas de ahorro</li>
                <li>• Recordatorios de pagos</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de Perfil */}
      {showProfile && (
        <UserProfile 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  )
}

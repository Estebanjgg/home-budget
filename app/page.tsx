'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Auth from '@/components/Auth'
import UserProfile from '@/components/UserProfile'
import { Navbar } from '@/components/Navbar'
import { Dashboard } from '@/components/Dashboard'
import { BudgetManager } from '@/components/BudgetManager'
import { Footer } from '../components/Footer'
import GroceryManager from '@/components/GroceryManager';

export default function Home() {
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'grocery'>('dashboard')

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
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src="/logo-aplicativo/logo_esteban.png" 
                alt="Home Budget Logo" 
                className="h-20 w-auto mx-auto mb-6 drop-shadow-lg"
              />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Home Budget
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow">
              Toma el control de tus finanzas personales con nuestra plataforma inteligente de presupuestos
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80 text-lg">
              <div className="flex items-center">
                <span className="mr-2">💰</span>
                <span>Gestión de Ingresos</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Control de Gastos</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span>Metas de Ahorro</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <Auth />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar unificado que incluye la funcionalidad de Navigation.tsx */}
      {!showProfile && (
        <Navbar 
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onProfileClick={() => setShowProfile(true)}
        />
      )}

      {/* Header simple para el perfil */}
      {showProfile && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img 
                  src="/logo-aplicativo/logo_esteban.png" 
                  alt="Home Budget" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-bold text-gray-800">Home Budget</h1>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="sr-only">Cerrar perfil</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showProfile ? (
          <UserProfile 
            user={user} 
            onClose={() => setShowProfile(false)}
          />
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'budgets' ? (
          <BudgetManager />
        ) : activeTab === 'grocery' ? (
          <GroceryManager onBack={() => setActiveTab('dashboard')} />
        ) : null}
      </main>
      
      {/* Agregar el footer al final */}
      <Footer />
    </div>
  )
}

import { useState } from 'react'
import UserMenu from './UserMenu'
import type { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User
  activeTab: 'dashboard' | 'budgets' | 'grocery'
  onTabChange: (tab: 'dashboard' | 'budgets' | 'grocery') => void
  onProfileClick: () => void
}

export function Navbar({ user, activeTab, onTabChange, onProfileClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="w-full bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-lg border-b border-blue-100 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center h-16 w-full">
          {/* Logo y título - Pegado a la izquierda */}
          <div className="flex items-center group flex-shrink-0">
            <div className="relative">
              <img 
                src="/logo-aplicativo/logo_esteban.png" 
                alt="Home Budget" 
                className="h-10 w-auto mr-4 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Home Budget
              </h1>
              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Gestión Financiera Inteligente</p>
            </div>
          </div>
          
          {/* Botones de navegación - Centrados */}
          <div className="flex space-x-3 flex-1 justify-center">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-md border border-gray-200/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-base">📊</span>
                <span>Dashboard</span>
              </span>
              {activeTab === 'dashboard' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-20 animate-pulse"></div>
              )}
            </button>
            
            <button
              onClick={() => onTabChange('budgets')}
              className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'budgets'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:text-emerald-600 hover:shadow-md border border-gray-200/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-base">💰</span>
                <span>Mis Presupuestos</span>
              </span>
              {activeTab === 'budgets' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-20 animate-pulse"></div>
              )}
            </button>
            <button
              onClick={() => onTabChange('grocery')}
              className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'grocery'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <span className="hidden sm:inline">🛒 Mis Gastos Supermercado</span>
              <span className="sm:hidden">🛒 Supermercado</span>
            </button>
          </div>
          
          {/* UserMenu - Pegado a la derecha */}
          <div className="flex-shrink-0">
            <UserMenu 
              user={user} 
              onProfileClick={onProfileClick}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden relative">
          {/* Mobile Header */}
          <div className="flex justify-between items-center h-16">
            {/* Logo compacto */}
            <div className="flex items-center">
              <img 
                src="/logo-aplicativo/logo_esteban.png" 
                alt="Home Budget" 
                className="h-8 w-auto mr-2"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Home Budget
              </h1>
            </div>
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-white/70 hover:bg-white transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="py-4 space-y-3 overflow-visible">
              {/* Navigation Buttons */}
              <button
                onClick={() => {
                  onTabChange('dashboard')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-blue-600 border border-gray-200/50'
                }`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-base">📊</span>
                  <span>Dashboard</span>
                </span>
              </button>
              
              <button
                onClick={() => {
                  onTabChange('budgets')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'budgets'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-emerald-600 border border-gray-200/50'
                }`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-base">💰</span>
                  <span>Mis Presupuestos</span>
                </span>
              </button>

              {/* Botón Mis Gastos Supermercado - AGREGADO */}
              <button
                onClick={() => {
                  onTabChange('grocery')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'grocery'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-purple-600 border border-gray-200/50'
                }`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-base">🛒</span>
                  <span>Mis Gastos Supermercado</span>
                </span>
              </button>

              {/* User Menu Mobile */}
              <div className="pt-3 border-t border-gray-200 relative z-50">
                <div className="overflow-visible">
                  <UserMenu 
                    user={user} 
                    onProfileClick={() => {
                      onProfileClick()
                      setIsMobileMenuOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
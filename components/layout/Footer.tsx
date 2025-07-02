import React from 'react'
import { getAssetPath } from '@/lib/utils'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Sección de la aplicación */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <img 
                src={getAssetPath("/logo-aplicativo/logo_esteban.png")} 
                alt="Home Budget" 
                className="h-6 sm:h-8 w-auto"
              />
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Home Budget
              </h3>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-none mx-auto sm:mx-0">
              Gestión financiera inteligente para tu hogar. Controla tus ingresos, gastos y presupuestos de manera eficiente.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center sm:items-start">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <span className="text-blue-300 text-xs sm:text-sm font-medium">💰 Presupuestos</span>
              </div>
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <span className="text-emerald-300 text-xs sm:text-sm font-medium">📊 Analytics</span>
              </div>
            </div>
          </div>

          {/* Sección de características */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold text-blue-300">Características</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Dashboard financiero completo</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Gestión de presupuestos</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Análisis de tendencias</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Reportes detallados</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Interfaz moderna y responsive</span>
              </li>
            </ul>
          </div>

          {/* Sección de redes sociales */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold text-indigo-300 text-center sm:text-left">Sígueme en Redes</h4>
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-3 sm:p-4 rounded-xl border border-blue-500/20 max-w-sm mx-auto sm:max-w-none sm:mx-0">
              <div className="flex items-center justify-center sm:justify-start space-x-3 mb-3 sm:mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">EG</span>
                </div>
                <div className="text-center sm:text-left">
                  <h5 className="font-bold text-white text-sm sm:text-base">Esteban González</h5>
                  <p className="text-blue-300 text-xs sm:text-sm">Full Stack Developer</p>
                </div>
              </div>
              
              {/* Redes sociales */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <a 
                  href="https://github.com/Estebanjgg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 bg-gray-800/50 hover:bg-gray-700/50 p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-gray-900 text-xs font-bold">GH</span>
                  </div>
                  <span className="text-gray-300 text-xs font-medium hidden sm:inline">GitHub</span>
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/esteban-jose-gonzalez-gomez-63271422b/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 bg-blue-600/30 hover:bg-blue-600/50 p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-5 sm:w-6 h-5 sm:h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                  <span className="text-blue-300 text-xs font-medium hidden sm:inline">LinkedIn</span>
                </a>
                
                <a 
                  href="https://www.facebook.com/estebamg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 bg-blue-700/30 hover:bg-blue-700/50 p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-5 sm:w-6 h-5 sm:h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="text-blue-300 text-xs font-medium hidden sm:inline">Facebook</span>
                </a>
                
                <a 
                  href="https://www.instagram.com/estebam05/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 hover:from-pink-500/50 hover:to-purple-500/50 p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📷</span>
                  </div>
                  <span className="text-pink-300 text-xs font-medium hidden sm:inline">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 pt-4 sm:pt-6">
          {/* Copyright centrado */}
          <div className="flex flex-col sm:flex-row justify-center items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center justify-center space-x-1 sm:space-x-2 text-center">
              <span className="text-gray-400 text-xs sm:text-sm">
                © {currentYear} Home Budget. Desarrollado con
              </span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span className="text-gray-400 text-xs sm:text-sm">por</span>
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent text-xs sm:text-sm">
                Esteban González
              </span>
            </div>
          </div>

          {/* Mensaje especial centrado */}
          <div className="flex justify-center items-center mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-center space-x-1 sm:space-x-2 text-center">
              <span className="text-gray-400 text-xs sm:text-sm">Conecta conmigo en redes sociales</span>
              <span className="text-blue-400">🌐</span>
            </div>
          </div>
        </div>

        {/* Mensaje especial */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-3 sm:px-4 py-2 rounded-full border border-blue-500/20 max-w-xs sm:max-w-none mx-auto">
            <span className="text-yellow-400 text-sm sm:text-base">⭐</span>
            <span className="text-gray-300 text-xs sm:text-sm text-center">
              "Transformando la gestión financiera personal con tecnología moderna"
            </span>
            <span className="text-yellow-400 text-sm sm:text-base">⭐</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
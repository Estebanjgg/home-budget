'use client'

import { useState } from 'react'
import { supabase } from '@/lib/config/supabase'
import { getAuthOptions, AUTH_REDIRECTS } from '@/lib/auth-config'


type AuthMode = 'login' | 'register' | 'reset'
type PasswordStrength = 'weak' | 'medium' | 'strong'

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkPasswordStrength = (password: string): PasswordStrength => {
    // Criterios obligatorios para contraseña fuerte
    const hasMinLength = password.length >= 8
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    // Contar criterios cumplidos
    let score = 0
    if (hasMinLength) score++
    if (hasLowercase) score++
    if (hasUppercase) score++
    if (hasNumbers) score++
    if (hasSpecialChars) score++
    
    // Para ser fuerte, debe cumplir TODOS los criterios
    if (hasMinLength && hasLowercase && hasUppercase && hasNumbers && hasSpecialChars) {
      return 'strong'
    }
    
    // Para ser mediana, debe cumplir al menos 3 criterios incluyendo longitud
    if (score >= 3 && hasMinLength) {
      return 'medium'
    }
    
    return 'weak'
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (mode === 'register' && value.length > 0) {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-100 text-red-700 border border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      case 'strong': return 'bg-green-100 text-green-700 border border-green-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return '⚠️ Débil'
      case 'medium': return '🔶 Mediana'
      case 'strong': return '✅ Fuerte'
      default: return ''
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('¡Inicio de sesión exitoso!')
      } else if (mode === 'register') {
        // Proceder directamente con el registro
        const authOptions = getAuthOptions()
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: AUTH_REDIRECTS.signUp()
          }
        })
        
        if (error) throw error
        
        // Si el usuario ya existe, Supabase retorna un usuario pero sin sesión
        // y con identities vacío
        if (data.user && !data.session && data.user.identities?.length === 0) {
          throw new Error('Este email ya está registrado. Por favor, Registrese con otro email.')
        }
        
        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: AUTH_REDIRECTS.resetPassword()
        })
        if (error) throw error
        setMessage('Se ha enviado un enlace de recuperación a tu email.')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto mt-4 sm:mt-8 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-sm">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {mode === 'login' && 'Iniciar Sesión'}
          {mode === 'register' && 'Registrarse'}
          {mode === 'reset' && 'Recuperar Contraseña'}
        </h2>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          {mode === 'login' && 'Bienvenido de vuelta'}
          {mode === 'register' && 'Crea tu cuenta nueva'}
          {mode === 'reset' && 'Recupera tu acceso'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 sm:space-y-6">
        <div className="group">
          <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-focus-within:text-blue-600 transition-colors">
            📧 Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
            placeholder="tu@email.com"
          />
        </div>

        {mode !== 'reset' && (
          <div className="group">
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-focus-within:text-blue-600 transition-colors">
              🔒 Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {mode === 'register' && password.length > 0 && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">🛡️ Fortaleza:</span>
                    <span className={`text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 rounded-full ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                  <div 
                    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out shadow-sm ${
                      passwordStrength === 'weak' ? 'bg-gradient-to-r from-red-400 to-red-500 w-1/3' :
                      passwordStrength === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 w-2/3' :
                      'bg-gradient-to-r from-green-400 to-emerald-500 w-full'
                    }`}
                  ></div>
                </div>
                {password.length > 0 && (
                  <div className="mt-3">
                    {passwordStrength === 'weak' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-semibold text-red-700 mb-2 flex items-center">
                          ⚠️ Contraseña débil. Necesitas:
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {password.length < 8 && <div className="flex items-center text-red-600 text-xs"><span className="mr-2">❌</span>Al menos 8 caracteres</div>}
                          {!/[a-z]/.test(password) && <div className="flex items-center text-red-600 text-xs"><span className="mr-2">❌</span>Letras minúsculas (a-z)</div>}
                          {!/[A-Z]/.test(password) && <div className="flex items-center text-red-600 text-xs"><span className="mr-2">❌</span>Letras mayúsculas (A-Z)</div>}
                          {!/\d/.test(password) && <div className="flex items-center text-red-600 text-xs"><span className="mr-2">❌</span>Números (0-9)</div>}
                          {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && <div className="flex items-center text-red-600 text-xs"><span className="mr-2">❌</span>Caracteres especiales (!@#$%^&*)</div>}
                        </div>
                      </div>
                    )}
                    {passwordStrength === 'medium' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-semibold text-yellow-700 mb-2 flex items-center">
                          🔶 Contraseña mediana. Para hacerla fuerte, agrega:
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {password.length < 8 && <div className="flex items-center text-yellow-600 text-xs"><span className="mr-2">❌</span>Al menos 8 caracteres</div>}
                          {!/[a-z]/.test(password) && <div className="flex items-center text-yellow-600 text-xs"><span className="mr-2">❌</span>Letras minúsculas (a-z)</div>}
                          {!/[A-Z]/.test(password) && <div className="flex items-center text-yellow-600 text-xs"><span className="mr-2">❌</span>Letras mayúsculas (A-Z)</div>}
                          {!/\d/.test(password) && <div className="flex items-center text-yellow-600 text-xs"><span className="mr-2">❌</span>Números (0-9)</div>}
                          {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && <div className="flex items-center text-yellow-600 text-xs"><span className="mr-2">❌</span>Caracteres especiales (!@#$%^&*)</div>}
                        </div>
                      </div>
                    )}
                    {passwordStrength === 'strong' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 font-semibold flex items-center">
                          ✅ ¡Excelente! Contraseña fuerte y segura.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 sm:py-4 sm:px-6 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </>
          ) : (
            <>
              {mode === 'login' && '🚀 Iniciar Sesión'}
              {mode === 'register' && '✨ Registrarse'}
              {mode === 'reset' && '📧 Enviar Enlace'}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
        {mode === 'login' && (
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => setMode('register')}
              className="block w-full text-center py-2 px-3 sm:px-4 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm hover:shadow-md"
            >
              💫 ¿No tienes cuenta? Regístrate
            </button>
            <button
              onClick={() => setMode('reset')}
              className="block w-full text-center py-2 px-3 sm:px-4 text-gray-600 hover:text-white hover:bg-gray-600 border border-gray-300 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm hover:shadow-md"
            >
              🔑 ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
        
        {mode === 'register' && (
          <button
            onClick={() => setMode('login')}
            className="block w-full text-center py-2 px-3 sm:px-4 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm hover:shadow-md"
          >
            🔐 ¿Ya tienes cuenta? Inicia sesión
          </button>
        )}
        
        {mode === 'reset' && (
          <button
            onClick={() => setMode('login')}
            className="block w-full text-center py-2 px-3 sm:px-4 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm hover:shadow-md"
          >
            🔙 Volver al inicio de sesión
          </button>
        )}
      </div>

      {message && (
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border shadow-sm ${
          message.includes('exitoso') || message.includes('enviado') 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message}
        </div>
      )}


    </div>
  )
}
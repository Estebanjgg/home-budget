'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/config/supabase'
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  // Validación de fortaleza de contraseña
  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
  const passwordsMatch = password === confirmPassword && password.length > 0

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (session) {
          setIsValidSession(true)
        } else {
          setMessage('Sesión inválida o expirada. Por favor, solicita un nuevo enlace de recuperación.')
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      } catch (error: any) {
        console.error('Error verificando sesión:', error)
        setMessage('Error verificando la sesión. Redirigiendo...')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } finally {
        setChecking(false)
      }
    }

    checkSession()
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordStrong) {
      setMessage('La contraseña no cumple con los requisitos de seguridad.')
      return
    }

    if (!passwordsMatch) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('¡Contraseña actualizada exitosamente! Redirigiendo...')
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      console.error('Error actualizando contraseña:', error)
      setMessage(error.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verificando sesión...</h2>
          <p className="text-gray-600">Por favor espera mientras validamos tu enlace de recuperación.</p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Sesión inválida</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            🏠 Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Nueva Contraseña</h2>
          <p className="text-gray-600">Ingresa tu nueva contraseña segura</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Indicadores de fortaleza de contraseña */}
          {password && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Requisitos de contraseña:</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordStrength.length ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Una letra mayúscula
                </div>
                <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordStrength.lowercase ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Una letra minúscula
                </div>
                <div className={`flex items-center ${passwordStrength.number ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordStrength.number ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Un número
                </div>
                <div className={`flex items-center ${passwordStrength.special ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordStrength.special ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Un carácter especial
                </div>
              </div>
            </div>
          )}

          {/* Verificación de coincidencia */}
          {confirmPassword && (
            <div className={`flex items-center text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
              {passwordsMatch ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
            </div>
          )}

          {/* Mensaje */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('exitosamente') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || !isPasswordStrong || !passwordsMatch}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
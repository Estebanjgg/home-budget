'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/config/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        // Si hay un error en los parámetros
        if (error) {
          throw new Error(errorDescription || 'Error en la autenticación')
        }

        // Manejar diferentes tipos de callback
        if (type === 'signup') {
          setMessage('¡Cuenta verificada exitosamente! Redirigiendo...')
          setStatus('success')
          
          // Esperar un momento para mostrar el mensaje
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else if (type === 'recovery') {
          setMessage('Enlace de recuperación válido. Redirigiendo para cambiar contraseña...')
          setStatus('success')
          
          setTimeout(() => {
            router.push('/auth/reset-password')
          }, 2000)
        } else if (accessToken && refreshToken) {
          // Establecer la sesión con los tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            throw sessionError
          }

          setMessage('¡Autenticación exitosa! Redirigiendo...')
          setStatus('success')
          
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          // Verificar si ya hay una sesión activa
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setMessage('¡Ya tienes una sesión activa! Redirigiendo...')
            setStatus('success')
            
            setTimeout(() => {
              router.push('/')
            }, 1500)
          } else {
            throw new Error('No se pudo establecer la sesión')
          }
        }
      } catch (error: any) {
        console.error('Error en callback de autenticación:', error)
        setStatus('error')
        setMessage(error.message || 'Error desconocido en la autenticación')
        
        // Redirigir al login después de mostrar el error
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verificando autenticación...</h2>
            <p className="text-gray-600">Por favor espera mientras procesamos tu solicitud.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">¡Éxito!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="flex items-center justify-center">
              <svg className="animate-spin w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-600 font-medium">Redirigiendo...</span>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Error de autenticación</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >🏠 Volver al inicio</button>
          </>
        )}
      </div>
    </div>
  )
}
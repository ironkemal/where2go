'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Mail, Lock, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı.'
          : error.message
      )
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#F59E0B', fontFamily: 'var(--font-geist-sans)' }}
          >
            Where2Go
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Tekrar hoş geldiniz
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Seyahat planlarınıza devam edin
        </p>
      </div>

      <div
        className="rounded-2xl p-8 border"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              E-posta
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                strokeWidth={1.8}
              />
              <input
                {...register('email')}
                type="email"
                placeholder="ad@ornek.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: errors.email
                    ? '1px solid rgba(239,68,68,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(245,158,11,0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.email
                    ? '1px solid rgba(239,68,68,0.5)'
                    : '1px solid rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Şifre
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                strokeWidth={1.8}
              />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: errors.password
                    ? '1px solid rgba(239,68,68,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(245,158,11,0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.password
                    ? '1px solid rgba(239,68,68,0.5)'
                    : '1px solid rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            style={{
              background: isSubmitting
                ? 'rgba(245,158,11,0.5)'
                : 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: isSubmitting
                ? 'none'
                : '0 4px 20px rgba(245,158,11,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow =
                  '0 6px 24px rgba(245,158,11,0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = isSubmitting
                ? 'none'
                : '0 4px 20px rgba(245,158,11,0.3)'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div
          className="mt-6 pt-6 text-center text-sm text-slate-500"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          Hesabın yok mu?{' '}
          <Link
            href="/signup"
            className="font-medium transition-colors duration-200"
            style={{ color: '#F59E0B' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = '#FCD34D')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = '#F59E0B')
            }
          >
            Kaydol
          </Link>
        </div>
      </div>
    </div>
  )
}

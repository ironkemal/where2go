'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Şifreyi tekrar girin'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword'

function InputField({
  label,
  icon: Icon,
  error,
  inputProps,
}: {
  label: string
  icon: React.ElementType
  error?: string
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <Icon
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          strokeWidth={1.8}
        />
        <input
          {...inputProps}
          onFocus={(e) => {
            setFocused(true)
            inputProps.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            inputProps.onBlur?.(e)
          }}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
          style={{
            background: 'rgba(15,23,42,0.6)',
            border: error
              ? '1px solid rgba(239,68,68,0.5)'
              : focused
              ? '1px solid rgba(245,158,11,0.5)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focused ? '0 0 0 3px rgba(245,158,11,0.08)' : 'none',
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccess(true)
  }

  const fields: {
    name: FieldName
    label: string
    icon: React.ElementType
    type: string
    placeholder: string
    autoComplete: string
  }[] = [
    {
      name: 'fullName',
      label: 'Ad Soyad',
      icon: User,
      type: 'text',
      placeholder: 'Adınız Soyadınız',
      autoComplete: 'name',
    },
    {
      name: 'email',
      label: 'E-posta',
      icon: Mail,
      type: 'email',
      placeholder: 'ad@ornek.com',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Şifre',
      icon: Lock,
      type: 'password',
      placeholder: '••••••••',
      autoComplete: 'new-password',
    },
    {
      name: 'confirmPassword',
      label: 'Şifre Tekrar',
      icon: Lock,
      type: 'password',
      placeholder: '••••••••',
      autoComplete: 'new-password',
    },
  ]

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
            style={{ color: '#F59E0B' }}
          >
            Where2Go
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hesap oluştur
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Seyahat planlamaya hemen başlayın
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
        {success ? (
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(245,158,11,0.15)' }}
            >
              <CheckCircle2
                className="w-8 h-8"
                style={{ color: '#F59E0B' }}
                strokeWidth={1.8}
              />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              E-postanı doğrula
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Doğrulama bağlantısı e-posta adresine gönderildi. Lütfen
              gelen kutunuzu kontrol edin.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm font-medium transition-colors duration-200"
              style={{ color: '#F59E0B' }}
            >
              Giriş sayfasına dön →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {fields.map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                icon={field.icon}
                error={errors[field.name]?.message}
                inputProps={{
                  ...register(field.name),
                  type: field.type,
                  placeholder: field.placeholder,
                  autoComplete: field.autoComplete,
                }}
              />
            ))}

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
                  Hesap oluşturuluyor...
                </>
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>
        )}

        {!success && (
          <div
            className="mt-6 pt-6 text-center text-sm text-slate-500"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            Zaten hesabın var mı?{' '}
            <Link
              href="/login"
              className="font-medium transition-colors duration-200"
              style={{ color: '#F59E0B' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FCD34D')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#F59E0B')}
            >
              Giriş yap
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

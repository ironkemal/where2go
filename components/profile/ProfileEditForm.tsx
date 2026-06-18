'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileEditForm({ initialName }: { initialName: string }) {
  const [fullName, setFullName] = useState(initialName)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const supabase = createClient()

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleNameSave() {
    if (!fullName.trim()) return
    setNameLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
    setNameLoading(false)
    if (error) {
      showToast('Ad güncellenemedi: ' + error.message, 'error')
    } else {
      showToast('Ad başarıyla güncellendi.', 'success')
    }
  }

  async function handlePasswordSave() {
    if (!newPassword || newPassword.length < 6) {
      showToast('Yeni şifre en az 6 karakter olmalı.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Şifreler eşleşmiyor.', 'error')
      return
    }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) {
      showToast('Şifre güncellenemedi: ' + error.message, 'error')
    } else {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Şifre başarıyla güncellendi.', 'success')
    }
  }

  return (
    <>
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
            color: toast.type === 'success' ? '#34D399' : '#FCA5A5',
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
        >
          <h3 className="text-base font-semibold text-white mb-4">Ad Soyad</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={handleNameSave}
              disabled={nameLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
              {nameLoading ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
        >
          <h3 className="text-base font-semibold text-white mb-4">Şifre Değiştir</h3>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mevcut şifre"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifre (min. 6 karakter)"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifre (tekrar)"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={handlePasswordSave}
              disabled={pwLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
              {pwLoading ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(239,68,68,0.2)', backdropFilter: 'blur(12px)' }}
        >
          <h3 className="text-base font-semibold mb-1" style={{ color: '#FCA5A5' }}>Tehlikeli Bölge</h3>
          <p className="text-xs text-slate-500 mb-4">Bu işlem geri alınamaz.</p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Hesabı Sil
          </button>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#1E293B', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <h4 className="text-lg font-bold text-white">Hesabı Sil</h4>
            <p className="text-sm text-slate-400">Hesabınızı silmek istediğinizden emin misiniz? Tüm planlarınız ve verileriniz kalıcı olarak silinecektir.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  showToast('Bu özellik henüz aktif değil.', 'error')
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

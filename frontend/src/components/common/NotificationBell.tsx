import { useState, useEffect, useRef } from 'react'
import { getSocket } from '../../services/socketService'
import api from '../../services/api'
import { Notification } from '../../types'
import toast from 'react-hot-toast'

// Extension locale pour les données temps-réel
interface RichNotification extends Notification {
  attemptId?: string | null
  canUnblock?: boolean
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<RichNotification[]>([])
  const [open, setOpen]   = useState(false)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { loadNotifications() }, [])

  // Nouvelles notifs en temps réel via Socket.io
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = (notif: RichNotification) => {
      setNotifications(prev => [notif, ...prev])
    }
    socket.on('notification:new', handler)
    return () => { socket.off('notification:new', handler) }
  }, [])

  // Fermeture au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications')
      setNotifications(data.notifications)
    } catch { /* silencieux */ }
  }

  const markRead = async (id: string) => {
    await api.patch(`/admin/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
  }

  const markAllRead = async () => {
    await api.patch('/admin/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
  }

  // Débloquer l'étudiant
  const handleUnblock = async (notif: RichNotification) => {
    if (!notif.attemptId || unlocking) return
    setUnlocking(notif.id)
    try {
      const { data } = await api.post(`/admin/attempts/${notif.attemptId}/unblock`)
      toast.success(data.message || 'Étudiant débloqué')
      // Mettre à jour toutes les notifications liées à cet attempt
      setNotifications(prev =>
        prev.map(n =>
          n.attemptId === notif.attemptId ? { ...n, canUnblock: false, lu: true } : n
        )
      )
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors du déblocage')
    } finally {
      setUnlocking(null)
    }
  }

  const unread    = notifications.filter(n => !n.lu).length
  const blocked   = notifications.filter(n => n.canUnblock).length

  const typeColor = (type: string) => type === 'TAB_CHANGE'
    ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-400'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'

  const TypeIcon = ({ type }: { type: string }) => type === 'TAB_CHANGE'
    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
    : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>

  return (
    <div className="relative" ref={ref}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {/* Badge rouge — étudiants bloqués en priorité */}
        {blocked > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-white text-[10px] font-bold animate-pulse">
            {blocked}
          </span>
        )}
        {blocked === 0 && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning-500 text-white text-[10px] font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel notifications */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-modal animate-scale-in">

          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              <div className="flex items-center gap-2 mt-0.5">
                {blocked > 0 && (
                  <span className="badge badge-danger text-[10px]">
                    {blocked} bloqué{blocked > 1 ? 's' : ''}
                  </span>
                )}
                {unread > 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {unread} non lue{unread > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="text-sm text-slate-400 dark:text-slate-500">Aucune notification</p>
              </div>
            ) : notifications.slice(0, 25).map(notif => (
              <div
                key={notif.id}
                className={`flex flex-col gap-2 px-4 py-3 transition-colors ${
                  notif.canUnblock
                    ? 'bg-danger-50/60 dark:bg-danger-900/15 hover:bg-danger-50 dark:hover:bg-danger-900/25'
                    : !notif.lu
                      ? 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icône type */}
                  <span className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${typeColor(notif.type)}`}>
                    <TypeIcon type={notif.type} />
                  </span>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(notif.createdAt).toLocaleString('fr-FR', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: 'short',
                      })}
                    </p>
                  </div>

                  {!notif.lu && !notif.canUnblock && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0 hover:bg-primary-600 transition-colors"
                      title="Marquer comme lu"
                    />
                  )}
                </div>

                {/* Bouton Débloquer — visible uniquement si l'étudiant est encore bloqué */}
                {notif.canUnblock && notif.attemptId && (
                  <button
                    onClick={() => handleUnblock(notif)}
                    disabled={unlocking === notif.id}
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-danger-600 hover:bg-danger-700 disabled:opacity-60 text-white text-xs font-semibold transition-all"
                  >
                    {unlocking === notif.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                    Débloquer l'étudiant
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

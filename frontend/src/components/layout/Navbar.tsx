import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../common/NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'ADMIN'
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: <IconGrid /> },
    { to: '/admin/exams', label: 'Examens', icon: <IconDoc /> },
    { to: '/admin/students', label: 'Étudiants', icon: <IconUsers /> },
    { to: '/admin/classes', label: 'Classes', icon: <IconGroup /> },
    { to: '/admin/guide', label: 'Guide PDF', icon: <IconHelp /> },
  ]
  const studentLinks = [
    { to: '/student/dashboard', label: 'Mes examens', icon: <IconDoc /> },
    { to: '/student/history', label: 'Historique', icon: <IconClock /> },
    { to: '/student/guide', label: 'Guide PDF', icon: <IconHelp /> },
  ]
  const links = isAdmin ? adminLinks : studentLinks

  const isActive = (to: string) => (
    to === '/admin/dashboard' || to === '/student/dashboard'
      ? location.pathname === to
      : location.pathname.startsWith(to)
  )

  const activeCls = 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/10 dark:text-primary-300 dark:border-primary-500/20'
  const idleCls = 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="h-1 w-full bg-gradient-to-r from-primary-700 via-primary-600 to-sky-500" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex shrink-0 items-center gap-3">
            <BrandMark />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold tracking-[0.16em] text-slate-900 dark:text-white">QCM PRO</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi</p>
            </div>
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${isActive(link.to) ? activeCls : idleCls}`}
              >
                <span className="h-4 w-4">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin && <NotificationBell />}

            <button
              onClick={toggleTheme}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? 'Clair' : 'Sombre'}
            </button>

            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100">{user?.prenom} {user?.nom}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{isAdmin ? 'Administrateur' : 'Étudiant'}</p>
              </div>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isAdmin ? 'bg-primary-700' : 'bg-sky-600'}`}>
                {initials}
              </div>
            </div>

            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/admin/guide')}
                  title="Guide administrateur"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <IconHelp />
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  title="Paramètres"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <IconSettings />
                </button>
              </>
            )}

            <button
              onClick={logout}
              title="Déconnexion"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
            >
              <IconLogout />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {mobileOpen
                ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Navigation</div>
              <button
                onClick={toggleTheme}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? 'Clair' : 'Sombre'}
              </button>
            </div>
            <div className="space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${isActive(link.to) ? activeCls : idleCls}`}
                >
                  <span className="h-4 w-4">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

const IconGrid = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-full w-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
const IconDoc = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-full w-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" /></svg>
const IconUsers = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-full w-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
const IconGroup = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-full w-full"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
const IconClock = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-full w-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const IconLogout = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
const IconSettings = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const IconHelp = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
const BrandMark = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-sm">
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15M4.5 12h9M4.5 17.25h15" />
    </svg>
  </div>
)

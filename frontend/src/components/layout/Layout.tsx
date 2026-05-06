import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200"> <Navbar /> <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8"> <div className="animate-fade-in"> <Outlet /> </div> </main> </div> )
}

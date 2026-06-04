'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Niveles', href: '/#niveles' },
  { name: 'Sobre Nosotros', href: '/#sobre' },
  { name: 'Admisiones', href: '/#admisiones' },
  { name: 'Contacto', href: '/#contacto' },
  { name: 'Egresados', href: '/egresados' },
]

export function Navbar() {
  const pathname = usePathname()
  const isEgresados = pathname === '/egresados'
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Estilos según contexto
  const hasDarkBg = isEgresados || (!scrolled && isHome)
  const isSolid = isEgresados || scrolled

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    // Si es un hash y estamos en home, hacer scroll suave
    if (href.startsWith('/#') && isHome) {
      const id = href.replace('/#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isSolid
          ? hasDarkBg
            ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg'
            : 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="IPM D64"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className={`font-bold text-sm md:text-lg font-poppins truncate ${
                hasDarkBg ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="hidden md:inline">Instituto Parroquial Mansilla D64</span>
                <span className="md:hidden">IPM D64</span>
              </h1>
              <p className={`text-[10px] md:text-xs ${
                hasDarkBg ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Formando el futuro
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = link.href === '/egresados' 
                ? isEgresados 
                : link.href === '/' 
                  ? isHome && !scrolled
                  : false

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-base font-medium font-poppins transition-colors hover:text-amber-500 ${
                    hasDarkBg ? 'text-white' : 'text-gray-700'
                  } ${isActive ? 'text-amber-400' : ''}`}
                >
                  {link.name}
                </Link>
              )
            })}
            <Link
              href="https://school-platform-campus-app.vercel.app/login"
              className={`text-base font-medium font-poppins transition-colors hover:text-amber-500 ${
                hasDarkBg ? 'text-white' : 'text-gray-700'
              }`}
            >
              Campus Virtual
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg ${
              hasDarkBg ? 'text-white' : 'text-gray-700'
            }`}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`md:hidden ${
            hasDarkBg 
              ? 'bg-blue-900/95 backdrop-blur-md border-t border-white/10' 
              : 'bg-white border-t'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`block px-4 py-3 rounded-xl text-lg font-medium font-poppins transition-colors ${
                  hasDarkBg
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="https://school-platform-campus-app.vercel.app/login"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-lg font-medium font-poppins transition-colors ${
                hasDarkBg
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Campus Virtual
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button, cn } from '@school/ui'
import { ThemeToggle } from '../theme-toggle'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Nuestra Escuela', href: '/nosotros' },
  { name: 'Nivel Secundario', href: '/nivel-secundario' },
  { name: 'Admisiones', href: '/admisiones' },
  { name: 'Vida Estudiantil', href: '/vida-estudiantil' },
  { name: 'Noticias', href: '/noticias' },
  { name: 'Contacto', href: '/contacto' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <motion.div
          className="flex lg:flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EM</span>
            </div>
            <span className="font-heading font-bold text-xl hidden sm:block">
              Escuela Moderna
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden lg:flex lg:gap-x-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-sm font-medium leading-6 text-foreground/70 hover:text-foreground transition-colors group"
            >
              {item.name}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ThemeToggle />
          <Link href="http://localhost:3001">
            <Button variant="default" size="sm">
              Campus Virtual
            </Button>
          </Link>
        </motion.div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden gap-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden bg-background"
      >
        <div className="space-y-1 px-4 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="http://localhost:3001"
            className="block rounded-lg px-3 py-2.5 text-base font-medium text-center bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setMobileMenuOpen(false)}
          >
            Campus Virtual
          </Link>
        </div>
      </motion.div>
    </motion.header>
  )
}
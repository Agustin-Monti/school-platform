'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  institucion: [
    { name: 'Nuestra Escuela', href: '/nosotros' },
    { name: 'Historia', href: '/nosotros#historia' },
    { name: 'Equipo Directivo', href: '/nosotros#equipo' },
    { name: 'Infraestructura', href: '/nosotros#infraestructura' },
  ],
  academico: [
    { name: 'Nivel Secundario', href: '/nivel-secundario' },
    { name: 'Plan de Estudios', href: '/nivel-secundario#plan' },
    { name: 'Orientaciones', href: '/nivel-secundario#orientaciones' },
    { name: 'Talleres', href: '/vida-estudiantil#talleres' },
  ],
  informacion: [
    { name: 'Admisiones', href: '/admisiones' },
    { name: 'Noticias', href: '/noticias' },
    { name: 'Eventos', href: '/noticias#eventos' },
    { name: 'Contacto', href: '/contacto' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo y descripción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Link href="/" className="flex items-center gap-x-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">EM</span>
              </div>
              <span className="font-heading font-bold text-xl">
                Escuela Moderna
              </span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Formando líderes del mañana con excelencia académica y valores 
              humanos desde 1999.
            </p>
            <div className="flex space-x-6">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-6 w-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {Object.entries(footerLinks).map(([category, links], catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <h3 className="text-sm font-semibold leading-6 text-foreground capitalize">
                    {category}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info y copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 border-t pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Av. Siempre Viva 742
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +54 11 1234-5678
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@escuelamoderna.edu.ar
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} Escuela Secundaria Moderna. 
              Todos los derechos reservados.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
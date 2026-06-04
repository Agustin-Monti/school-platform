import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Franja superior decorativa */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-500 to-purple-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo + Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="IPM D64"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-poppins leading-tight">
                  Instituto Parroquial Mansilla D64
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Formando líderes del mañana desde 1966. 60 años de excelencia educativa.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Youtube className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-poppins">Enlaces</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#sobre" className="text-gray-400 hover:text-amber-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#niveles" className="text-gray-400 hover:text-amber-400 transition-colors">Niveles</a></li>
              <li><a href="#admisiones" className="text-gray-400 hover:text-amber-400 transition-colors">Admisiones</a></li>
              <li><Link href="/egresados" className="text-gray-400 hover:text-amber-400 transition-colors">Egresados</Link></li>
              <li><Link href="/registro" className="text-gray-400 hover:text-amber-400 transition-colors">Registro</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-poppins">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                Av. Siempre Viva 742, Ciudad
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                +54 11 1234-5678
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                info@ipmansilla.edu.ar
              </li>
            </ul>
          </div>

          {/* Campus + Horario */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-poppins">Campus Virtual</h4>
            <Link
              href="http://localhost:3001/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-full text-sm font-semibold font-poppins hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-500/25 mb-4"
            >
              Ingresar al Campus
            </Link>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p className="font-medium text-white">Horarios de atención</p>
              <p>Lunes a Viernes</p>
              <p>7:15 - 17:15 hs</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Instituto Parroquial Mansilla D64. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
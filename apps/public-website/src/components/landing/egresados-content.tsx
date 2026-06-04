'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, ImageIcon, Eye, X } from 'lucide-react'
import Image from 'next/image'
import { EgresadosSplash } from './egresados-splash'

type Promo = {
  id: string
  graduation_year: number
  photo_url: string | null
  phrase: string | null
  total_students: number
}

export function EgresadosContent({ promos }: { promos: Promo[] }) {
  const [showSplash, setShowSplash] = useState(true)
  const [decadaSeleccionada, setDecadaSeleccionada] = useState<number | null>(null)
  const [zoomPromo, setZoomPromo] = useState<Promo | null>(null)
  const [tooltipVisible, setTooltipVisible] = useState(true)

  const decadas = [...new Set(promos.map(p => Math.floor(p.graduation_year / 10) * 10))]
    .sort((a, b) => a - b)

  const promosDecada = decadaSeleccionada !== null
    ? promos.filter(p => Math.floor(p.graduation_year / 10) * 10 === decadaSeleccionada)
        .sort((a, b) => a.graduation_year - b.graduation_year)
    : []

  const volverADecadas = () => setDecadaSeleccionada(null)

  return (
    <>
      {/* SPLASH */}
      <AnimatePresence>
        {showSplash && <EgresadosSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* CONTENIDO */}
      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 pt-24 md:pt-28 pb-16"
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {decadaSeleccionada !== null 
                  ? `Promos ${decadaSeleccionada}s`
                  : 'Nuestros Egresados'
                }
              </h1>
              <p className="text-gray-500 mt-2 font-poppins">60 años de historia</p>
              
              {decadaSeleccionada !== null && (
                <button onClick={volverADecadas}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Volver a décadas
                </button>
              )}
            </motion.div>

            {/* VISTA 1: GRID DE DÉCADAS */}
            {decadaSeleccionada === null && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                {decadas.map((decada, index) => {
                  const count = promos.filter(p => Math.floor(p.graduation_year / 10) * 10 === decada).length
                  const totalEgresados = promos
                    .filter(p => Math.floor(p.graduation_year / 10) * 10 === decada)
                    .reduce((acc, p) => acc + p.total_students, 0)
                  return (
                    <motion.button
                      key={decada}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      onClick={() => setDecadaSeleccionada(decada)}
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 text-center group"
                    >
                      <span className="text-4xl md:text-5xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {String(decada).slice(-2)}'
                      </span>
                      <p className="text-sm text-gray-500 mt-2 group-hover:text-amber-600 transition-colors">
                        {count} promo{count > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{totalEgresados} egresados</p>
                    </motion.button>
                  )
                })}
              </div>
            )}

            {/* VISTA 2: POLAROIDS DE UNA DÉCADA */}
            {decadaSeleccionada !== null && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {promosDecada.map((promo, index) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    {/* Marco Polaroid */}
                    <div 
                      className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-2 pb-6 md:pb-8"
                      style={{ 
                        transform: `rotate(${(promo.graduation_year % 5 - 2) * 0.8}deg)`,
                      }}
                    >
                      {/* Foto con overlay + tooltip */}
                      <div className="relative w-full aspect-[4/5] rounded overflow-visible bg-gradient-to-br from-blue-100 to-indigo-100 mb-2 group/photo">
                        {promo.photo_url ? (
                          <>
                            <Image 
                              src={promo.photo_url} 
                              alt={`Promo ${promo.graduation_year}`}
                              width={300}
                              height={375}
                              className="object-cover w-full h-full rounded"
                            />
                            

                            {/* Overlay + botones */}
                            <div 
                              className="absolute inset-0 bg-black/0 md:group-hover/photo:bg-black/40 transition-all duration-300 flex items-center justify-center cursor-pointer rounded"
                              onClick={(e) => { 
                                e.stopPropagation()
                                setTooltipVisible(false)
                                setZoomPromo(promo) 
                              }}
                            >
                              {/* Botón desktop (solo hover) */}
                              <div className="hidden md:flex opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40">
                                <Eye className="h-7 w-7 text-white" />
                                
                              </div>
                              {/* Botón móvil con tooltip integrado */}
                              <div className="md:hidden absolute bottom-2 right-2 z-20">
                                <div className="flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-full">
                                  <Eye className="h-4 w-4 text-white" />
                                  {tooltipVisible && (
                                    <span className="text-white text-[10px] font-medium whitespace-nowrap">
                                      Tocá para ampliar
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded">
                            <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Texto Polaroid */}
                      <div className="text-center px-1">
                        <p className="font-bold text-base md:text-xl text-gray-900 font-poppins">
                          {promo.graduation_year}
                        </p>
                        {promo.phrase && (
                          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 leading-tight italic line-clamp-2">
                            "{promo.phrase}"
                          </p>
                        )}
                        <p className="text-[9px] md:text-[10px] text-gray-400 mt-1">
                          {promo.total_students} egresados
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* MODAL ZOOM FOTO */}
      <AnimatePresence>
        {zoomPromo && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setZoomPromo(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex flex-col items-center justify-center"
            >
              {/* Botón cerrar */}
              <button 
                onClick={() => setZoomPromo(null)}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>

              {/* Info */}
              <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                <p className="text-white font-bold text-lg md:text-2xl font-poppins">{zoomPromo.graduation_year}</p>
                {zoomPromo.phrase && (
                  <p className="text-white/70 text-xs md:text-sm italic">"{zoomPromo.phrase}"</p>
                )}
              </div>

              {/* Imagen */}
              {zoomPromo.photo_url ? (
                <img 
                  src={zoomPromo.photo_url} 
                  alt={`Promo ${zoomPromo.graduation_year}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-white/50">
                  <ImageIcon className="h-16 w-16 md:h-24 md:w-24 mx-auto mb-4 opacity-30" />
                  <p className="text-base md:text-lg">Foto no disponible</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
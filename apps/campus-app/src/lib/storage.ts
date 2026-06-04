import { createClient } from '@/lib/supabase'

export async function deleteFromStorage(url: string, bucket: string = 'entregas') {
  if (!url || !url.includes('supabase.co/storage')) return

  try {
    const supabase = createClient()
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // La URL es: /storage/v1/object/public/BUCKET/ruta/archivo.pdf
    const bucketIndex = pathParts.indexOf(bucket)
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/')
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        console.error('Error al eliminar archivo:', error)
      } else {
        console.log('✅ Archivo eliminado:', filePath)
      }
    }
  } catch (err) {
    console.error('Error al parsear URL:', err)
  }
}

export async function deleteMultipleFromStorage(urls: string[], bucket: string = 'entregas') {
  for (const url of urls) {
    await deleteFromStorage(url, bucket)
  }
}
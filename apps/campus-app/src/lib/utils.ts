const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const dia = date.getDate()
  const mes = MESES_CORTOS[date.getMonth()]
  return `${dia} ${mes}`
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const dia = date.getDate()
  const mes = MESES_CORTOS[date.getMonth()]
  const horas = String(date.getHours()).padStart(2, '0')
  const minutos = String(date.getMinutes()).padStart(2, '0')
  return `${dia} ${mes}, ${horas}:${minutos}`
}
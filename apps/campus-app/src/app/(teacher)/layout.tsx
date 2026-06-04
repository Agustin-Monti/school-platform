import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel del Profesor - Campus Virtual',
  description: 'Panel de gestión para profesores',
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {children}
    </div>
  )
}
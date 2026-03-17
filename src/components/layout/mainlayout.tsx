import Sidebar from './sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <main className="w-full md:ml-64 pt-20 md:pt-0 px-4 md:px-6 py-4 md:py-6">
        {children}
      </main>
    </div>
  )
}
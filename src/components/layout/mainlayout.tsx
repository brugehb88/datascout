import Sidebar from './sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-950 min-h-screen overflow-x-hidden">
      <Sidebar />
      <main className="w-full min-w-0 md:ml-64 pt-20 md:pt-6 px-4 md:px-8 pb-6">
        {children}
      </main>
    </div>
  )
}
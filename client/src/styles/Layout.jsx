import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Footer from '../components/Footer/Footer'
import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Siderbar'

const SIDEBAR_OPEN = 280
const SIDEBAR_MINI = 84
const HEADER_HEIGHT = 72

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sidebarWidth = isSidebarOpen ? SIDEBAR_OPEN : SIDEBAR_MINI

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar" style={{ width: sidebarWidth }}>
        <Sidebar isMini={!isSidebarOpen} onExpand={() => setIsSidebarOpen(true)} />
      </aside>

      <div className="app-shell__main" style={{ marginLeft: sidebarWidth }}>
        <header className="app-shell__header" style={{ height: HEADER_HEIGHT }}>
          <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        </header>

        <main
          className="app-shell__content"
          style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
        >
          <Outlet />
        </main>

        <footer className="app-shell__footer">
          <Footer />
        </footer>
      </div>
    </div>
  )
}

export default Layout

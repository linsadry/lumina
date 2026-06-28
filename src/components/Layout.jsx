import { Outlet, NavLink } from 'react-router-dom'
import { Home, BookOpen, BarChart3 } from 'lucide-react'

const NAV = [
  { to: '/', icon: Home, label: 'Início', exact: true },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/stats', icon: BarChart3, label: 'Estatísticas' },
]

export default function Layout() {
  return (
    <>
      <Outlet />
      <nav className="bottom-nav">
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} strokeWidth={1.6} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

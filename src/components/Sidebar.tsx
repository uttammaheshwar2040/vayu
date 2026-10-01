export type NavSection = 'Dashboard' | 'Analytics' | 'Monetization' | 'Settings'

type SidebarProps = {
  active: NavSection
  onSelect: (section: NavSection) => void
}

const sections: NavSection[] = ['Dashboard', 'Analytics', 'Monetization', 'Settings']

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Dashboard navigation">
      <h2 className="sidebar__title">Creator Dashboard</h2>
      <p className="sidebar__subtitle">Private prototype area</p>
      <nav>
        <ul className="sidebar__nav">
          {sections.map((section) => {
            const isActive = section === active
            return (
              <li key={section}>
                <button
                  type="button"
                  onClick={() => onSelect(section)}
                  className={`sidebar__button${isActive ? ' sidebar__button--active' : ''}`}
                >
                  {section}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

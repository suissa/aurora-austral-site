import { tocData } from '../data/toc';

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 pb-8">
        <p className="text-xs uppercase tracking-widest text-austral-text-muted font-heading font-semibold mb-4 px-3">
          On this page
        </p>
        <nav className="space-y-0.5">
          {tocData.map(item => (
            <div key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`toc-item w-full text-left block ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.title}
              </button>
              {item.children?.map(child => (
                <button
                  key={child.id}
                  onClick={() => onNavigate(child.id)}
                  className={`toc-item w-full text-left block pl-6 text-[0.8rem] ${activeSection === child.id ? 'active' : ''}`}
                >
                  {child.title}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

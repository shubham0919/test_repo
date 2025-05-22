'use client';

import Link from 'next/link';
import { useAuth } from '../lib/authContext'; // Adjusted path
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard_projects_page', label: 'Projects' },
    // Add more dashboard links here as needed
    // e.g. { href: '/dashboard_settings_page', label: 'Settings' },
  ];

  // Determine the active page for styling the link
  const isActive = (href: string) => pathname === href || (href === '/dashboard_projects_page' && pathname?.startsWith('/dashboard_projects'));


  if (!user) {
    return null; // Don't show sidebar if not logged in (though layout should protect routes)
  }

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-6 flex flex-col fixed">
      <div className="mb-10">
        <Link href="/dashboard_projects_page" className="text-2xl font-semibold hover:text-gray-300">
          TokenSaaS
        </Link>
        {user && <p className="text-sm text-gray-400 mt-1">Welcome, {user.email}</p>}
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map(item => (
            <li key={item.href} className="mb-3">
              <Link
                href={item.href}
                className={`block py-2 px-3 rounded-md text-lg hover:bg-gray-700 ${
                  isActive(item.href) ? 'bg-blue-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-lg"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

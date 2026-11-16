import { useState } from 'react';
import { Link } from 'react-router-dom';

import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/provider';
import { navigationItems } from '../app/routePaths';

export default function Navbar() {
  const { messages: t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navigationItems.map(({ to, label, target }) => ({
    to,
    label: label(t),
    target,
  }));

  return (
    <nav className="container-main flex justify-between items-center py-6 relative">
      {/* Desktop nav */}
      <div className="hidden md:flex gap-6">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            {...(link.target && { target: link.target, rel: 'noreferrer' })}
            className="hover:underline"
          >
            {link.label}
            {link.target && <span className="ml-1">↗</span>}
          </Link>
        ))}
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden px-3 py-2 border rounded"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Language switcher */}
      <div className="flex gap-2 ml-4">
        <LanguageSwitcher />
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-background dark:bg-neutral-900 shadow-md md:hidden z-10 transition-all duration-300">
          <div className="flex flex-col p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                {...(link.target && { target: link.target, rel: 'noreferrer' })}
                className="hover:underline"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                {link.target && <span className="ml-1">↗</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

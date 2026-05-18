import { LayoutDashboard, ShoppingBag, Calendar, Image as ImageIcon, Users, Settings, FileText, Menu, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const NavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: FileText },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/managers', label: 'Managers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  // Simple static sidebar for now. In a real app we'd use state to make it collapsible on mobile.
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-earth-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-earth-200">
        <Link href="/" className="font-serif font-bold text-xl text-tertiary-900">
          MeriGauMata Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NavLinks.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-foreground/80 hover:bg-earth-100 hover:text-foreground transition-colors">
            <item.icon className="h-5 w-5 mr-3 text-foreground/50" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-earth-200">
        <div className="flexItems-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-foreground/60">admin@gauseva.org</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

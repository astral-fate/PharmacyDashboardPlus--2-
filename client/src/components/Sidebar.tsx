import React from 'react';
import { useLocation, Link } from 'wouter';
import { 
  LayoutDashboard, 
  Pill, 
  Building2, 
  Users, 
  Settings,
  Package
} from 'lucide-react';

const sidebarItems = [
  { id: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { id: '/medicines', icon: Pill, label: 'Medicines' },
  { id: '/pharmacies', icon: Building2, label: 'Pharmacies' },
  { id: '/inventory', icon: Package, label: 'Inventory' },
  { id: '/users', icon: Users, label: 'Users' },
  { id: '/settings', icon: Settings, label: 'Settings' }
];

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold text-blue-600">WIMM Admin</h1>
      </div>
      <nav className="mt-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.id}
            href={item.id}
            className={`w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              location === item.id ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

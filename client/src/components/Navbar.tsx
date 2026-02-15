import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@shared/schema';

export const Navbar: React.FC = () => {
  const [location, setLocation] = useLocation();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const displayCategories = categories.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <nav className="bg-white border-b overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[110px] md:top-[135px] z-40">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-center gap-6 md:gap-10 py-3 md:py-4">
          <li>
            <button
              onClick={() => setLocation('/')}
              className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest transition-all pb-2 border-b-4 border-transparent hover:border-black ${
                location === '/' ? 'text-primary border-primary' : 'text-black'
              }`}
            >
              الرئيسية
            </button>
          </li>
          {displayCategories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setLocation(`/category/${cat.name}`)}
                className={`text-[12px] md:text-[14px] font-black uppercase tracking-widest transition-all pb-2 border-b-4 border-transparent hover:border-black ${
                  location === `/category/${cat.name}` ? 'text-primary border-primary' : 'text-black'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

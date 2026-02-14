import React from 'react';
import { useLocation } from 'wouter';

export const Navbar: React.FC = () => {
  const [location, setLocation] = useLocation();

  const categories = [
    { name: 'نساء', path: '/category/women' },
    { name: 'مقاسات كبيرة', path: '/category/plus-size' },
    { name: 'أطفال', path: '/category/kids' },
    { name: 'ملابس رجالية', path: '/category/men' },
    { name: 'ملابس داخلية وملابس نوم', path: '/category/lingerie' },
    { name: 'المنزل والمطبخ', path: '/category/home' },
    { name: 'الصحة والجمال', path: '/category/beauty' },
    { name: 'الإكسسوارات', path: '/category/accessories' },
    { name: 'مجوهرات', path: '/category/jewelry' },
    { name: 'الحقائب', path: '/category/bags' },
    { name: 'أحذية', path: '/category/shoes' },
    { name: 'التخفيضات', path: '/category/sale', className: 'text-red-600 font-bold' },
    { name: 'جديد', path: '/category/new', className: 'text-primary font-bold' },
  ];

  return (
    <nav className="bg-white border-b overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[105px] z-40">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <ul className="flex items-center gap-6 py-3">
          {categories.map((cat) => (
            <li key={cat.path}>
              <button
                onClick={() => setLocation(cat.path)}
                className={`text-[15px] hover:text-primary transition-colors pb-1 border-b-2 border-transparent hover:border-primary ${
                  location === cat.path ? 'text-primary border-primary' : 'text-gray-800'
                } ${cat.className || ''}`}
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

import { Link } from 'react-router-dom';
import { supabase, type Category } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').limit(8).then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  return (
    <footer className="mt-12 bg-surface-dark text-gray-300">
      <div className="bg-surface-mid py-3 text-center">
        <a href="#top" className="text-sm text-white transition hover:underline">
          Back to top
        </a>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <h4 className="mb-3 font-bold text-white">Get to Know Us</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="transition hover:text-white">About ShopVerse</a></li>
            <li><a href="#" className="transition hover:text-white">Careers</a></li>
            <li><a href="#" className="transition hover:text-white">Press Releases</a></li>
            <li><a href="#" className="transition hover:text-white">Sustainability</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Shop by Category</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link to={`/category/${cat.slug}`} className="transition hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="transition hover:text-white">Help Center</a></li>
            <li><a href="#" className="transition hover:text-white">Returns & Refunds</a></li>
            <li><a href="#" className="transition hover:text-white">Shipping Info</a></li>
            <li><a href="#" className="transition hover:text-white">Track Your Order</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Make Money with Us</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="transition hover:text-white">Sell on ShopVerse</a></li>
            <li><a href="#" className="transition hover:text-white">Become an Affiliate</a></li>
            <li><a href="#" className="transition hover:text-white">Advertise Products</a></li>
            <li><a href="#" className="transition hover:text-white">Self-Publish</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-6">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ShopVerse. All rights reserved. This is a demo store built for showcase purposes.
        </p>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  rating: number;
  reviewsCount: number;
}

export default function ProductCard({ id, name, price, discount, image, rating, reviewsCount }: ProductCardProps) {
  const finalPrice = discount ? price - discount : price;

  return (
    <Link href={`/product/${id}`} className="bg-white p-3 rounded hover:shadow-lg transition-shadow border border-transparent hover:border-gray-100 flex flex-col h-full">
      <div className="relative aspect-square mb-3">
        <img src={image} alt={name} className="object-contain w-full h-full" />
        {discount && (
          <span className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-1 rounded">خصم {Math.round((discount/price)*100)}%</span>
        )}
      </div>
      <p className="text-xs text-gray-700 line-clamp-2 h-8 mb-2 leading-tight">{name}</p>
      <div className="mt-auto">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm font-bold">SAR <span className="text-lg">{finalPrice}</span></span>
          {discount && <span className="text-xs text-gray-400 line-through">{price}</span>}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-green-600 text-white text-[10px] px-1 rounded gap-0.5">
            <span>{rating}</span>
            <Star size={8} fill="currentColor" />
          </div>
          <span className="text-[10px] text-gray-400">({reviewsCount})</span>
        </div>
        <div className="mt-2">
          <img src="https://z.nooncdn.com/s/app/com/noon/images/en_badge_express_v1.png" alt="Express" className="h-3" />
        </div>
      </div>
    </Link>
  );
}

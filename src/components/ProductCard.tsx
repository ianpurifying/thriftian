import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="border-4 border-amber-800 rounded-lg overflow-hidden hover:shadow-xl transition-all bg-cream retro-shadow-hover paper-curl">
        <div className="aspect-square bg-amber-50 relative border-b-4 border-amber-800">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-full h-full object-cover vintage-hover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-pacifico text-amber-700 text-xl">
              No Image
            </div>
          )}
          {product.condition && (
            <div className="absolute top-2 right-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-nunito font-bold border-2 border-teal-800 retro-shadow condition-badge">
              {product.condition}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-nunito font-bold text-lg truncate text-amber-900">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 truncate font-nunito mt-1">
            {product.brand || "Vintage Find"}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-2xl font-rye text-amber-900 price-tag">
                ₱{product.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-nunito">In Stock</p>
              <p className="text-sm font-nunito font-bold text-teal-700">
                {product.stock} left
              </p>
            </div>
          </div>

          {product.averageRating > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm bg-amber-100 px-3 py-2 rounded-lg border-2 border-amber-300">
              <span className="text-lg">⭐</span>
              <span className="font-nunito font-bold text-amber-900">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600 font-nunito text-xs">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

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

          {/* Star rating badge */}
          {product.averageRating > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1  px-2 py-1 rounded-full border border-amber-300 shadow-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    product.averageRating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.538 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.783.57-1.838-.197-1.538-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.047 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
                </svg>
              ))}
            </div>
          )}

          {/* Condition badge */}
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
        </div>
      </div>
    </Link>
  );
}

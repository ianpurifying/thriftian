// app/product/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, Review } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Loading from "@/components/Loading";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${params.id}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (product) {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        imageUrl: product.images[0]?.url || "",
        stock: product.stock,
      });
      alert("Added to cart!");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setSubmitting(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: params.id,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        setShowReviewForm(false);
        setComment("");
        setRating(5);
        fetchReviews();
        fetchProduct();
        alert("Review submitted!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                No Image
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <div className="flex items-center gap-4 mb-4">
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <span>⭐ {product.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold mb-4">₱{product.price.toFixed(2)}</p>

          <div className="space-y-2 mb-6">
            <p>
              <span className="font-medium">Brand:</span>{" "}
              {product.brand || "N/A"}
            </p>
            <p>
              <span className="font-medium">Category:</span> {product.category}
            </p>
            <p>
              <span className="font-medium">Condition:</span>{" "}
              {product.condition}
            </p>
            <p>
              <span className="font-medium">Size:</span> {product.size || "N/A"}
            </p>
            <p>
              <span className="font-medium">Stock:</span> {product.stock}{" "}
              available
            </p>
            <p>
              <span className="font-medium">Seller:</span> {product.sellerName}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {product.status === "approved" && product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(product.stock, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="w-24"
                />
              </div>

              <Button onClick={handleAddToCart} className="w-full">
                Add to Cart
              </Button>
            </div>
          )}

          {product.status !== "approved" && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
              This product is currently {product.status}
            </div>
          )}

          {product.stock === 0 && (
            <div className="p-4 bg-red-100 text-red-800 rounded">
              Out of stock
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
          {user?.role === "buyer" && (
            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
              Write a Review
            </Button>
          )}
        </div>

        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-8 p-6 border rounded-lg"
          >
            <div className="mb-4">
              <label className="block mb-2 font-medium">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="px-3 py-2 border rounded"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{review.buyerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// app/dashboard/seller/edit-product/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Product, ProductCondition } from "@/lib/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Loading from "@/components/Loading";

interface FormData {
  title: string;
  description: string;
  brand: string;
  category: string;
  size: string;
  condition: ProductCondition;
  price: string;
  stock: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    brand: "",
    category: "",
    size: "",
    condition: "New",
    price: "",
    stock: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id && firebaseUser) {
      fetchProduct();
    }
  }, [params.id, firebaseUser]);

  const fetchProduct = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        setFormData({
          title: data.product.title,
          description: data.product.description,
          brand: data.product.brand || "",
          category: data.product.category,
          size: data.product.size || "",
          condition: data.product.condition,
          price: data.product.price.toString(),
          stock: data.product.stock.toString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setSubmitting(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          brand: formData.brand || null,
          size: formData.size || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (response.ok) {
        alert("Product updated successfully!");
        router.push("/dashboard/seller");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !firebaseUser ||
      !confirm("Are you sure you want to delete this product?")
    )
      return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        router.push("/dashboard/seller");
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  if (user?.role !== "seller") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Access denied.</p>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 hover:underline">
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Product Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={5}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brand (optional)"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Size (optional)"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />

          <Select<ProductCondition>
            label="Condition"
            value={formData.condition}
            onChange={(value) => setFormData({ ...formData, condition: value })}
            options={[
              { value: "New", label: "New" },
              { value: "Like New", label: "Like New" },
              { value: "Used", label: "Used" },
              { value: "Fair", label: "Fair" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price (₱)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />

          <Input
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Product"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete Product
          </Button>
        </div>
      </form>
    </div>
  );
}

// app/dashboard/seller/add-product/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCondition } from "@/lib/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";

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

export default function AddProductPage() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    brand: "",
    category: "",
    size: "",
    condition: "New", // now TS knows this is ProductCondition
    price: "",
    stock: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !firebaseUser) return;

    setUploading(true);

    try {
      const token = await firebaseUser.getIdToken();

      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64 = reader.result as string;

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image: base64, folder: "products" }),
          });

          if (response.ok) {
            const data = await response.json();
            setImages((prev) => [
              ...prev,
              JSON.stringify({ url: data.url, publicId: data.publicId }),
            ]);
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setSubmitting(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/products", {
        method: "POST",
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
          images: images.map((img) => JSON.parse(img)),
        }),
      });

      if (response.ok) {
        alert("Product added successfully! Waiting for admin approval.");
        router.push("/dashboard/seller");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "seller") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Access denied. Seller role required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 hover:underline">
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

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

        <div>
          <label className="block mb-2 font-medium">
            Product Images (max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm"
            disabled={uploading || images.length >= 5}
          />
          {uploading && (
            <p className="text-sm text-gray-600 mt-2">Uploading...</p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-4">
              {images.map((img, index) => {
                const parsed = JSON.parse(img);
                return (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded"
                  >
                    <img
                      src={parsed.url}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? "Adding Product..." : "Add Product"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// src/components/admin/EditProductModal.tsx
import { useState } from "react";
import { Product, ProductCondition, ProductImage } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    brand: product.brand || "",
    category: product.category,
    size: product.size || "",
    condition: product.condition,
    price: product.price.toString(),
    stock: product.stock.toString(),
  });

  const [images, setImages] = useState<string[]>(
    product.images.map((img) => JSON.stringify(img))
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !firebaseUser) return;

    setUploading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const remainingSlots = 5 - images.length;

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
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
          } else {
            showToast("Failed to upload image", "error");
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Failed to upload images", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = JSON.parse(images[index]) as ProductImage;

    // If it's an existing image (has publicId), delete from Cloudinary
    if (imageToRemove.publicId && firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ publicId: imageToRemove.publicId }),
        });
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    if (images.length === 0) {
      showToast("Please add at least one product image", "error");
      return;
    }

    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          brand: formData.brand || null,
          category: formData.category,
          size: formData.size || null,
          condition: formData.condition,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images: images.map((img) => JSON.parse(img)),
        }),
      });

      if (response.ok) {
        showToast("Product updated successfully", "success");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update product", "error");
      }
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Product Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
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

            <div>
              <label className="block mb-2 font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              >
                <option value="">Select a category</option>
                <option disabled>— Apparel —</option>
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Dresses & Jumpsuits">Dresses & Jumpsuits</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Activewear">Activewear</option>
                <option value="Sleepwear & Loungewear">
                  Sleepwear & Loungewear
                </option>

                <option disabled>— Footwear —</option>
                <option value="Sneakers">Sneakers</option>
                <option value="Sandals">Sandals</option>
                <option value="Boots">Boots</option>
                <option value="Heels">Heels</option>
                <option value="Flats">Flats</option>

                <option disabled>— Accessories —</option>
                <option value="Bags & Wallets">Bags & Wallets</option>
                <option value="Belts">Belts</option>
                <option value="Caps & Hats">Caps & Hats</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Sunglasses">Sunglasses</option>
                <option value="Scarves & Gloves">Scarves & Gloves</option>

                <option disabled>— Vintage & Collectibles —</option>
                <option value="Vintage Clothing">Vintage Clothing</option>
                <option value="Vintage Accessories">Vintage Accessories</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Retro / Y2K">Retro / Y2K</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Size (optional)"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
            />

            <Select<ProductCondition>
              label="Condition"
              value={formData.condition}
              onChange={(value) =>
                setFormData({ ...formData, condition: value })
              }
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
              className="block w-full text-sm border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
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
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {images.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                At least one image is required
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

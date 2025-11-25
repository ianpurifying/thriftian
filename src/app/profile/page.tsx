// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Save,
  X,
  Edit2,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Types matching your codebase
interface Address {
  street: string;
  city: string;
  province: string;
  zip: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "buyer" | "seller" | "admin";
  verified: boolean;
  phone: string | null;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfilePage = () => {
  const { user: authUser, refreshUser, resendVerificationEmail } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Sync with auth context user
  useEffect(() => {
    if (authUser) {
      const userProfile: UserProfile = {
        ...authUser,
        createdAt:
          authUser.createdAt instanceof Date
            ? authUser.createdAt
            : new Date(authUser.createdAt),
        updatedAt:
          authUser.updatedAt instanceof Date
            ? authUser.updatedAt
            : new Date(authUser.updatedAt),
      } as UserProfile;

      setUser(userProfile);
      setEditedUser(userProfile);
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/users/${currentUser.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const userData: UserProfile = {
        ...data.user,
        createdAt: data.user.createdAt
          ? new Date(data.user.createdAt)
          : new Date(),
        updatedAt: data.user.updatedAt
          ? new Date(data.user.updatedAt)
          : new Date(),
      };

      setUser(userData);
      setEditedUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      setError(null);
      setResendSuccess(false);

      await resendVerificationEmail();

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification email"
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const handleRefreshVerification = async () => {
    try {
      await refreshUser();
      await fetchUserProfile();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh verification status"
      );
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedUser.name,
          phone: editedUser.phone,
          address: editedUser.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      const updatedUserData: UserProfile = {
        ...data.user,
        createdAt: data.user.createdAt
          ? new Date(data.user.createdAt)
          : new Date(),
        updatedAt: data.user.updatedAt
          ? new Date(data.user.updatedAt)
          : new Date(),
      };

      setUser(updatedUserData);
      setEditedUser(updatedUserData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user || {});
    setIsEditing(false);
    setError(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "N/A";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    } catch {
      return "N/A";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "seller":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center">
            <X className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchUserProfile}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Verification Alert */}
        {!user.verified && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  Email Verification Required
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  Please verify your email address to access all features. Check
                  your inbox for the verification link.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {resendingEmail
                      ? "Sending..."
                      : "Resend Verification Email"}
                  </button>
                  <button
                    onClick={handleRefreshVerification}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 text-sm border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    I have Verified My Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-green-700">
                  Verification email sent successfully! Please check your inbox.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12">
              {/* Profile Photo */}
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {editedUser.photoURL || user.photoURL ? (
                    <img
                      src={editedUser.photoURL || user.photoURL || ""}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <User className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                )}
              </div>

              {/* User Info Header */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto sm:mx-0"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.verified && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Profile Information
          </h2>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedUser.phone || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.phone || "Not provided"}</p>
              )}
            </div>

            {/* Address Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Street
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address?.street || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          address: {
                            ...editedUser.address!,
                            street: e.target.value,
                          },
                        })
                      }
                      placeholder="Street address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.address.street || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address?.city || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          address: {
                            ...editedUser.address!,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.address.city || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Province
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address?.province || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          address: {
                            ...editedUser.address!,
                            province: e.target.value,
                          },
                        })
                      }
                      placeholder="Province"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.address.province || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    ZIP Code
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address?.zip || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          address: {
                            ...editedUser.address!,
                            zip: e.target.value,
                          },
                        })
                      }
                      placeholder="ZIP Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.address.zip || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member Since
                  </label>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm break-all">
                    {user.id}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Account Status
                  </label>
                  <p className="text-gray-900">
                    {user.verified ? (
                      <span className="text-green-600 font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        Unverified
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

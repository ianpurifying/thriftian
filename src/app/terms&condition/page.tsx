"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TermsAndConditions() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using Thriftian, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the platform immediately. These terms apply to all users, including buyers, sellers, and visitors.`,
    },
    {
      title: "2. User Eligibility",
      content: `You must be at least 18 years of age to create an account and use Thriftian. By registering, you confirm that all information provided is accurate and up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.`,
    },
    {
      title: "3. User Roles and Responsibilities",
      content: `Thriftian operates with three distinct user roles:

• Buyers: May browse products, add items to cart and wishlist, place orders, track shipments, and leave reviews.
• Sellers: May list pre-loved apparel, manage inventory, process orders, provide tracking numbers, and view sales analytics.
• Administrators: Oversee user management, moderate content, approve product listings, and handle disputes.

Each user agrees to use the platform only for its intended purpose and in compliance with applicable laws.`,
    },
    {
      title: "4. Product Listings and Seller Obligations",
      content: `Sellers are solely responsible for the accuracy, quality, and legality of the items they list. All products must be pre-loved apparel including clothing, shoes, bags, and small accessories. Sellers must provide honest descriptions, accurate photos, and appropriate categorization by brand, size, and condition. Misrepresentation of products, including false claims about authenticity or condition, is strictly prohibited. Thriftian reserves the right to remove listings that violate these standards.`,
    },
    {
      title: "5. Prohibited Items and Conduct",
      content: `The following are strictly prohibited on Thriftian:

• Counterfeit, stolen, or illegally obtained items
• Items that violate intellectual property rights
• Hazardous or prohibited materials
• Offensive, discriminatory, or inappropriate content
• Harassment, fraud, or deceptive practices
• Attempts to bypass platform transactions

Violation of these rules may result in account suspension or permanent removal from the platform.`,
    },
    {
      title: "6. Orders and Payment",
      content: `Thriftian currently supports Cash on Delivery (COD) as the sole payment method. Buyers agree to pay the full amount upon receipt of goods. Orders are considered final once confirmed by the buyer during checkout. Buyers are responsible for providing accurate delivery information. Sellers are responsible for processing orders promptly and providing valid tracking numbers through third-party couriers such as LBC, J&T, or Grab.`,
    },
    {
      title: "7. Shipping and Delivery",
      content: `Thriftian does not operate its own logistics network. All shipping is handled through third-party courier services selected by the seller. Delivery timelines, shipping fees, and courier reliability are the responsibility of the seller and the chosen courier. Thriftian is not liable for delays, losses, or damages during transit. Domestic shipping within the Philippines is supported; international shipping is not available.`,
    },
    {
      title: "8. Returns, Refunds, and Disputes",
      content: `Returns and refunds are subject to agreement between the buyer and seller and must be processed outside the platform. Thriftian does not facilitate automated returns or refund logistics. In case of disputes, users may report issues to platform administrators, who will manually review and mediate the situation. Final resolution is at the discretion of the administrator based on platform policies and evidence provided.`,
    },
    {
      title: "9. Reviews and Ratings",
      content: `Buyers may leave honest reviews and ratings based on their purchase experience. Reviews must be respectful, relevant, and free from offensive language. Thriftian reserves the right to remove reviews that are abusive, fraudulent, or violate content guidelines. Sellers may not manipulate or incentivize reviews in exchange for benefits.`,
    },
    {
      title: "10. Intellectual Property",
      content: `All content on Thriftian, including the platform design, logo, text, graphics, and software, is the property of the project team or its licensors. Users may not copy, reproduce, distribute, or create derivative works without explicit permission. Product photos uploaded by sellers remain the property of the seller but grant Thriftian a license to display them on the platform.`,
    },
    {
      title: "11. Privacy and Data Protection",
      content: `Thriftian collects and processes user data in accordance with its Privacy Policy. By using the platform, you consent to the collection of information such as name, email, address, and order history. User data is stored securely using Firebase services and is used solely for platform operations, order processing, and communication. Thriftian will not sell or share personal data with third parties without consent, except as required by law.`,
    },
    {
      title: "12. Limitation of Liability",
      content: `Thriftian is provided on an "as is" and "as available" basis. The platform does not guarantee uninterrupted or error-free service. Thriftian is not responsible for:

• Quality, authenticity, or legality of items sold by users
• Disputes between buyers and sellers
• Loss or damage during shipping
• Third-party service failures including couriers and cloud providers
• Any indirect, incidental, or consequential damages arising from platform use

Users engage in transactions at their own risk.`,
    },
    {
      title: "13. Termination of Accounts",
      content: `Thriftian reserves the right to suspend or terminate user accounts that violate these Terms and Conditions, engage in fraudulent activity, or disrupt platform operations. Users may also voluntarily deactivate their accounts at any time. Upon termination, access to the platform and associated data may be revoked.`,
    },
    {
      title: "14. Modifications to Terms",
      content: `Thriftian may update or modify these Terms and Conditions at any time. Users will be notified of significant changes via email or platform announcements. Continued use of the platform after modifications constitutes acceptance of the updated terms.`,
    },
    {
      title: "15. Governing Law and Jurisdiction",
      content: `These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes arising from the use of Thriftian shall be resolved in the appropriate courts within the jurisdiction of the Philippines.`,
    },
    {
      title: "16. Contact Information",
      content: `For questions, concerns, or support regarding these Terms and Conditions, please contact the Thriftian team at:

Email: support@thriftian.com
Address: Colegio De Santo Cristo De Burgos, Philippines

By using Thriftian, you agree to these Terms and Conditions in full.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Thriftian: Online Marketplace for Pre-Loved Apparel
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to{" "}
            <span className="font-semibold text-emerald-600">Thriftian</span>, a
            web-based marketplace dedicated to pre-loved apparel. These Terms
            and Conditions govern your use of our platform and outline the
            rights, responsibilities, and obligations of all users. By creating
            an account or using any service on Thriftian, you agree to comply
            with these terms.
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {section.title}
                </h2>
                {expandedSection === index ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {expandedSection === index && (
                <div className="px-6 pb-4 pt-2">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Notice */}
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">
            Important Notice
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed">
            These Terms and Conditions constitute a legally binding agreement
            between you and Thriftian. Please read them carefully before using
            the platform. If you have any questions or concerns, feel free to
            reach out to our support team.
          </p>
        </div>

        {/* Copyright Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Thriftian. All rights reserved.</p>
          <p className="mt-1">Colegio De Santo Cristo De Burgos</p>
        </div>
      </div>
    </div>
  );
}

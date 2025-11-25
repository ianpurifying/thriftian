"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  UserCheck,
} from "lucide-react";

export default function PrivacyPolicy() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: `We collect information to provide, improve, and protect our services. The types of information we collect include:

Personal Information:
• Name and contact details (email address, phone number)
• Delivery address for order fulfillment
• Account credentials (username, password - encrypted)

Transaction Information:
• Order history and purchase details
• Product listings created by sellers
• Payment method information (Cash on Delivery confirmations)
• Tracking numbers and shipment status

User-Generated Content:
• Product photos uploaded by sellers
• Reviews and ratings submitted by buyers
• Communication between buyers and sellers through the platform

Technical Information:
• IP address and device information
• Browser type and operating system
• Cookies and usage data for platform functionality
• Log files and analytics data`,
    },
    {
      title: "2. How We Use Your Information",
      icon: UserCheck,
      content: `Thriftian uses collected information for the following purposes:

Service Delivery:
• Process and fulfill orders between buyers and sellers
• Facilitate account creation and authentication
• Enable product listing, browsing, and purchase functionality
• Send order confirmations and tracking updates via email

Platform Improvement:
• Analyze user behavior to enhance user experience
• Monitor platform performance and identify technical issues
• Develop new features based on user needs
• Generate seller analytics for sales insights

Security and Compliance:
• Detect and prevent fraudulent activities
• Enforce Terms and Conditions and community guidelines
• Resolve disputes between users
• Comply with legal obligations and law enforcement requests

Communication:
• Send transactional emails (order updates, account notifications)
• Respond to customer support inquiries
• Notify users of important platform updates or policy changes`,
    },
    {
      title: "3. How We Share Your Information",
      icon: Eye,
      content: `Thriftian respects your privacy and limits data sharing to essential purposes only:

With Other Users:
• Buyers can view seller profiles and product listings
• Sellers receive buyer delivery information to fulfill orders
• Public reviews and ratings are visible to all users

With Service Providers:
• Firebase (Google Cloud) for database, authentication, and hosting
• Cloudinary for image storage and content delivery
• Vercel for frontend hosting and deployment
• Email service providers for transactional notifications

With Third Parties:
• Courier services receive delivery addresses for shipping purposes
• We do not sell or rent your personal information to third parties for marketing

Legal Requirements:
• We may disclose information if required by law, court order, or government request
• To protect the rights, property, or safety of Thriftian, our users, or the public

We do not share your data with advertisers or use it for targeted advertising purposes.`,
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: `We implement security measures to protect your personal information:

Technical Safeguards:
• Firebase Authentication with encrypted password storage
• Secure HTTPS connections for all data transmission
• Cloud-based infrastructure with industry-standard security protocols
• Regular security updates and vulnerability assessments

Access Controls:
• Role-based access permissions (Buyer, Seller, Admin)
• Limited employee access to personal data on a need-to-know basis
• Secure admin authentication and activity logging

Data Integrity:
• Firestore security rules to prevent unauthorized data access
• Automated backups to prevent data loss
• Monitoring systems to detect suspicious activities

While we take reasonable measures to protect your data, no system is completely secure. Users are responsible for maintaining the confidentiality of their account credentials.`,
    },
    {
      title: "5. Your Rights and Choices",
      icon: Shield,
      content: `As a Thriftian user, you have the following rights regarding your personal information:

Access and Portability:
• Request a copy of the personal data we hold about you
• Download your order history and account information

Correction and Updates:
• Update your profile information at any time through your account settings
• Correct inaccuracies in your personal data

Deletion:
• Request deletion of your account and associated data
• Note that some information may be retained for legal or operational purposes
• Completed transactions and reviews may remain for record-keeping

Marketing Communications:
• Opt out of promotional emails (transactional emails cannot be disabled)
• Manage email notification preferences in account settings

Cookies:
• Control cookie preferences through your browser settings
• Note that disabling cookies may affect platform functionality

To exercise these rights, contact us at support@thriftian.com with your request.`,
    },
    {
      title: "6. Cookies and Tracking Technologies",
      icon: Database,
      content: `Thriftian uses cookies and similar technologies to enhance user experience:

Essential Cookies:
• Authentication cookies to keep you logged in
• Session cookies for shopping cart functionality
• Security cookies to prevent fraud

Analytics Cookies:
• Usage data to understand how users interact with the platform
• Performance metrics to identify and fix technical issues
• Aggregated statistics to improve features

You can manage cookie preferences through your browser settings. Disabling cookies may limit access to certain features.

We do not use third-party advertising cookies or sell your browsing data.`,
    },
    {
      title: "7. Data Retention",
      icon: Database,
      content: `We retain your information for as long as necessary to provide our services:

Active Accounts:
• Personal information is retained while your account is active
• Transaction history is maintained for seller analytics and buyer reference

Deleted Accounts:
• Account data is deleted within 30 days of deactivation request
• Some information may be retained for legal compliance (e.g., tax records, dispute resolution)

Inactive Accounts:
• Accounts with no activity for 3 years may be flagged for deletion
• Advance notice will be provided before permanent deletion

Legal Requirements:
• Data required for legal, tax, or regulatory purposes may be retained beyond account deletion`,
    },
    {
      title: "8. Children's Privacy",
      icon: Shield,
      content: `Thriftian is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.

If we become aware that a user is under 18, we will take steps to:
• Delete their account and associated data
• Prevent future access to the platform
• Notify parents or guardians if appropriate

Parents or guardians who believe their child has provided information to Thriftian should contact us immediately at support@thriftian.com.`,
    },
    {
      title: "9. International Data Transfers",
      icon: Database,
      content: `Thriftian operates within the Philippines and stores data primarily on servers located in or managed by Firebase (Google Cloud) and Cloudinary.

By using our platform, you consent to the transfer and processing of your information in accordance with this Privacy Policy and applicable data protection laws.

We ensure that third-party service providers comply with appropriate data protection standards.`,
    },
    {
      title: "10. Third-Party Links",
      icon: Eye,
      content: `Thriftian may contain links to third-party websites or services (e.g., courier tracking sites, social media platforms).

We are not responsible for:
• Privacy practices of external websites
• Content or security of third-party services
• Data collected by linked platforms

We encourage you to review the privacy policies of any third-party sites you visit.`,
    },
    {
      title: "11. Changes to This Privacy Policy",
      icon: Mail,
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When updates occur:
• The "Last Updated" date will be revised
• Significant changes will be communicated via email or platform notification
• Continued use of Thriftian after changes constitutes acceptance

We encourage you to review this policy periodically to stay informed about how we protect your information.`,
    },
    {
      title: "12. Contact Us",
      icon: Mail,
      content: `If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us:

Email: support@thriftian.com
Address: Colegio De Santo Cristo De Burgos, Philippines

Data Protection Officer:
For privacy-related inquiries, you may reach our project team through the contact information above.

We will respond to your inquiry within a reasonable timeframe, typically within 7-14 business days.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Thriftian: Online Marketplace for Pre-Loved Apparel
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            At <span className="font-semibold text-blue-600">Thriftian</span>,
            we are committed to protecting your privacy and ensuring the
            security of your personal information. This Privacy Policy explains
            how we collect, use, share, and protect your data when you use our
            platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By creating an account or using Thriftian, you acknowledge that you
            have read and understood this Privacy Policy and consent to the
            collection and use of your information as described herein.
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {section.title}
                    </h2>
                  </div>
                  {expandedSection === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
            );
          })}
        </div>

        {/* Key Principles Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Our Privacy Commitment
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                We collect only the information necessary to provide our
                services
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>We do not sell your personal data to third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                We implement industry-standard security measures to protect your
                data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>We give you control over your personal information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>We are transparent about our data practices</span>
            </li>
          </ul>
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

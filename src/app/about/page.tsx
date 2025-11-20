// src/app/about/page.tsx
"use client";

import Image from "next/image";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Rica May P. Dando",
      role: "UI/UX Designer",
      description:
        "Designs intuitive and visually appealing interfaces for smooth navigation and engaging user experience.",
      image: "/rica.jpg",
    },
    {
      name: "Ian V. Purificacion",
      role: "Full-Stack Developer",
      description:
        "Develops and integrates frontend and backend systems to deliver a functional, efficient, and scalable platform.",
      image: "/ian.jpg",
    },
    {
      name: "Nicole P. Villapando",
      role: "Quality Assurance Analyst",
      description:
        "Ensures thorough testing and verifies that the system meets required standards of functionality and reliability.",
      image: "/nicole.jpg",
    },
  ];

  const features = [
    {
      title: "Advanced Filtering",
      description:
        "Advanced product browsing with filtering by size, brand, and condition.",
      icon: "🔍",
    },
    {
      title: "Secure Shopping",
      description: "Wishlist, reviews, and secure checkout for buyers.",
      icon: "🛡️",
    },
    {
      title: "Seller Dashboard",
      description:
        "Comprehensive dashboard for sellers to manage listings, inventory, and orders.",
      icon: "📊",
    },
    {
      title: "Admin Tools",
      description:
        "Centralized admin tools for user management and content moderation.",
      icon: "⚙️",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-purple-50">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">
            {/* Logo */}
            <div className="relative w-32 h-32 mb-6">
              <Image
                src="/logo.png" // path from public/
                alt="Thriftian Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              About Thriftian
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl">
              An online marketplace dedicated to pre-loved apparel, connecting
              buyers and sellers in a structured, secure, and community-driven
              platform.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-t-4 border-purple-500">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
              Our goal is to make thrift shopping affordable, convenient, and
              sustainable while empowering small-scale sellers with tools to
              manage their products and orders.
            </p>
          </div>
        </section>

        {/* Project Team */}
        <section className="bg-gradient-to-b from-purple-50 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-purple-700 mb-4 text-center">
              Meet Our Team
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              The talented individuals behind Thriftian
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {/* Animated floating lines */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
                      <div
                        className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-contain relative z-10"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-purple-600 font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Background & Significance */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
            Background & Significance
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="text-3xl mr-3">📈</span>
                The Growing Trend
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The Philippines has seen a growing culture of thrift shopping,
                driven by affordability, sustainability, and shifting consumer
                values. Pre-loved clothing offers budget-friendly, stylish
                options while reducing textile waste.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-pink-100 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="text-3xl mr-3">💡</span>
                The Solution
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Existing platforms focus on brand-new products, leaving thrift
                sellers reliant on scattered social media shops, which are
                fragmented and inconvenient. Thriftian addresses this gap by
                providing a centralized, secure, and reliable marketplace.
              </p>
            </div>
          </div>
          <div className="mt-8 bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-500">
            <p className="text-lg text-gray-700 leading-relaxed">
              Thriftian empowers sellers with product management and order
              tracking tools, offers buyers an organized shopping experience,
              and promotes sustainable fashion practices.
            </p>
          </div>
        </section>

        {/* Objectives */}
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
              Our Objectives
            </h2>
            <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
              <ul className="space-y-4">
                {[
                  "Develop a web-based platform for buying and selling pre-loved clothing.",
                  "Implement transaction management with secure checkout and real-time order tracking.",
                  "Provide analytics and reporting tools for vendors to track sales and inventory.",
                  "Offer platform features like product listing, browsing with filters, wishlist, reviews, and secure checkout.",
                  "Promote sustainable fashion by encouraging the reuse of apparel.",
                ].map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-lg leading-relaxed">
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl font-bold text-purple-700 mb-4 text-center">
            Key Features
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Everything you need for a seamless thrifting experience
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-400 hover:border-pink-400"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience */}
        <section className="bg-gradient-to-b from-purple-50 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
              Who We Serve
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Primary Users</h3>
                <p className="text-lg leading-relaxed">
                  Online thrift sellers and small clothing resellers.
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-amber-400 text-white rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Secondary Users</h3>
                <p className="text-lg leading-relaxed">
                  Young adults, students, and professionals seeking affordable
                  and sustainable apparel.
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-purple-500 text-white rounded-xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Tertiary Users</h3>
                <p className="text-lg leading-relaxed">
                  Eco-conscious consumers supporting sustainable fashion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join the Thriftian Community
            </h2>
            <p className="text-xl mb-8 leading-relaxed">
              Be part of the sustainable fashion movement. Start buying or
              selling pre-loved apparel today!
            </p>
          </div>
        </section>
        {/* Contact Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <p className="font-semibold text-gray-700">Email</p>
                    <a
                      href="mailto:sacredmind2002@gmail.com"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      support@thriftian.online
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📱</span>
                  <div>
                    <p className="font-semibold text-gray-700">Phone</p>
                    <p className="text-gray-600">+63 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-semibold text-gray-700">Location</p>
                    <p className="text-gray-600">
                      Sariaya, Quezon, Philippines
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://www.facebook.com/ianpurifying/"
                    target="_blank"
                    className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                  >
                    f
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
                  >
                    IG
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white hover:bg-amber-600 transition-colors"
                  >
                    X
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Send Us a Message
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join the Thriftian Community
            </h2>
            <p className="text-xl mb-8 leading-relaxed">
              Be part of the sustainable fashion movement. Start buying or
              selling pre-loved apparel today!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

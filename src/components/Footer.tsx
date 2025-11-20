// src/components/Footer.tsx
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-purple-700 text-white mt-auto border-t-8 border-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-rye text-2xl mb-4 text-pink-200">
              <Image
                src="/logo.png"
                alt="Thriftian Logo"
                width={40}
                height={40}
                className="inline-block mr-2"
              />
              Thriftian
            </h3>
            <p className="text-sm font-nunito leading-relaxed text-purple-100">
              Your trusted destination for pre-loved treasures and vintage finds
              since 2025
            </p>
          </div>

          <div>
            <h3 className="font-rye text-2xl mb-4 text-amber-200">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm font-nunito">
              <li>
                <a
                  href="/about"
                  className="hover:text-amber-300 transition-colors"
                >
                  → About Us
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-amber-300 transition-colors"
                >
                  → Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-amber-300 transition-colors"
                >
                  → Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-rye text-2xl mb-4 text-amber-200">
              Get in Touch
            </h3>
            <p className="text-sm font-nunito text-amber-100">
              📧 support@thriftian.online
            </p>
            <p className="text-sm font-nunito mt-2 text-amber-100">
              Open Mon-Sat, 9AM-6PM
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-amber-800 text-center">
          <p className="text-sm font-pacifico text-amber-200">
            ~ Made with love for vintage enthusiasts ~
          </p>
          <p className="text-xs mt-2 font-nunito text-amber-300">
            &copy; 2025 Thriftian Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

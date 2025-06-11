import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-kafuffle-primary to-neutral-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <img src="/logo.svg" alt="Kafuffle Logo" className="h-7" />
            </div>
            <p className="text-neutral-400 mb-6 max-w-md">
              Transform your team's beautiful chaos into organized productivity.
              Chat, collaborate, and conquer projects together.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-all duration-300 ease-in-out"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-all duration-300 ease-in-out"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-all duration-300 ease-in-out"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          {/*<div>*/}
          {/*  <h3 className="font-semibold mb-4">Product</h3>*/}
          {/*  <ul className="space-y-2 text-neutral-400">*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="#features"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        Features*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="#pricing"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        Pricing*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="/auth"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        Get Started*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*  </ul>*/}
          {/*</div>*/}

          {/* Company */}
          {/*<div>*/}
          {/*  <h3 className="font-semibold mb-4">Company</h3>*/}
          {/*  <ul className="space-y-2 text-neutral-400">*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="#about"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        About*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="#contact"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        Contact*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link*/}
          {/*        href="#privacy"*/}
          {/*        className="hover:text-white transition-all duration-300 ease-in-out"*/}
          {/*      >*/}
          {/*        Privacy*/}
          {/*      </Link>*/}
          {/*    </li>*/}
          {/*  </ul>*/}
          {/*</div>*/}
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2025 Kafuffle. Made with ❤️ for productive chaos.</p>
        </div>
      </div>
    </footer>
  );
}

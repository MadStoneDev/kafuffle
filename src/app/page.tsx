import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Kanban,
  Calendar,
  FileText,
  Users,
  Zap,
  Shield,
  Smartphone,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className={`bg-gradient-to-br from-kafuffle-primary via-white to-neutral-50 py-20`}
        >
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
            <div className={`text-center`}>
              <h1
                className={`text-4xl md:text-6xl font-bold text-neutral-900 mb-6`}
              >
                Organize Your
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-r from-kafuffle-primary to-neutral-900`}
                >
                  {" "}
                  Beautiful Chaos
                </span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                Transform scattered team communication into structured
                productivity. Chat, collaborate, and manage projects all in one
                beautiful workspace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/auth`}
                  className={`inline-flex items-center px-8 py-4 bg-kafuffle-primary text-white rounded-lg hover:bg-kafuffle-primary/70 transition-all duration-300 ease-in-out font-semibold text-lg`}
                >
                  Start Your Free Workspace
                  <ArrowRight className={`ml-2 h-5 w-5`} />
                </Link>
                <Link
                  href={`#features`}
                  className={`inline-flex items-center px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:border-kafuffle-primary hover:bg-neutral-50 transition-all duration-300 ease-in-out font-semibold text-lg`}
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
            <div className={`text-center mb-16`}>
              <h2
                className={`text-3xl md:text-4xl font-bold text-neutral-900 mb-4`}
              >
                Everything Your Team Needs
              </h2>
              <p className={`text-xl text-neutral-600 max-w-2xl mx-auto`}>
                Stop juggling multiple tools. Kafuffle brings chat, project
                management, and collaboration into one seamless experience.
              </p>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`}
            >
              <div
                className={`text-center p-6 rounded-xl hover:bg-neutral-50 transition-all duration-300 ease-in-out`}
              >
                <div
                  className={`w-12 h-12 bg-kafuffle-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4`}
                >
                  <MessageSquare className={`h-6 w-6 text-kafuffle-primary`} />
                </div>
                <h3 className={`text-lg font-semibold text-neutral-900 mb-2`}>
                  Team Chat
                </h3>
                <p className={`text-neutral-600`}>
                  Organized channels with markdown support for clear
                  communication
                </p>
              </div>

              <div
                className={`text-center p-6 rounded-xl hover:bg-neutral-50 transition-all duration-300 ease-in-out`}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Kanban className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Kanban Boards
                </h3>
                <p className="text-neutral-600">
                  Visual project management with drag-and-drop simplicity
                </p>
              </div>

              <div
                className={`text-center p-6 rounded-xl hover:bg-neutral-50 transition-all duration-300 ease-in-out`}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Calendar
                </h3>
                <p className="text-neutral-600">
                  Schedule events and track project timelines effortlessly
                </p>
              </div>

              <div className="text-center p-6 rounded-xl hover:bg-neutral-50 transition-all duration-300 ease-in-out">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Documents
                </h3>
                <p className="text-neutral-600">
                  Collaborative docs and knowledge base for your team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Kafuffle Section */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  Why Teams Choose Kafuffle
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-kafuffle-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="h-4 w-4 text-kafuffle-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Lightning Fast
                      </h3>
                      <p className="text-neutral-600">
                        Real-time updates keep everyone in sync without delays
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Secure & Private
                      </h3>
                      <p className="text-neutral-600">
                        Enterprise-grade security with granular permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Smartphone className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Mobile Ready
                      </h3>
                      <p className="text-neutral-600">
                        Beautiful responsive design works on all devices
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Scale With You
                      </h3>
                      <p className="text-neutral-600">
                        From solo projects to enterprise teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-kafuffle-primary/50 rounded-full"></div>
                      <div>
                        <div className="h-2 bg-neutral-200 rounded w-24"></div>
                        <div className="h-2 bg-neutral-100 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="h-2 bg-kafuffle-primary/30 rounded w-full mb-2"></div>
                      <div className="h-2 bg-kafuffle-primary/10 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-16 bg-neutral-100 rounded"></div>
                      <div className="h-16 bg-neutral-100 rounded"></div>
                      <div className="h-16 bg-neutral-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-kafuffle-primary/60 to-neutral-900">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Organize Your Chaos?
            </h2>
            <p className="text-xl text-neutral-100/60 mb-8">
              Join thousands of teams who've transformed their workflow with
              Kafuffle
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-white text-kafuffle-primary hover:text-neutral-50 rounded-lg hover:bg-kafuffle-primary/70 transition-all duration-300 ease-in-out font-semibold text-lg"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

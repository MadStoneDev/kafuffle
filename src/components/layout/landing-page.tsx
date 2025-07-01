import React from "react";
import {
  IconArrowRight,
  IconCheck,
  IconMessage,
  IconCalendar,
  IconUsers,
  IconShield,
  IconBolt,
  IconHeart,
} from "@tabler/icons-react";
import { View } from "@/types";
import Link from "next/link";

export default function LandingPage({
  onViewChange,
}: {
  onViewChange: (view: View) => void;
}) {
  return (
    <div
      className={`flex-grow bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-4xl h-full overflow-y-auto`}
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <section
          className={`relative mb-12 grid place-content-center min-h-[400px] rounded-2xl text-center border border-neutral-700 dark:border-neutral-600 overflow-hidden`}
          style={{
            backgroundImage: `url(hero-bg.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center 70%",
          }}
        >
          {/* Background Overlay - stays behind content */}
          <div
            className={`absolute inset-0 bg-neutral-900 opacity-30 rounded-2xl`}
          />

          {/* Content - positioned above overlay */}
          <div className="relative z-10">
            <div className="mb-8">
              <h1
                className={`flex flex-col items-center text-3xl md:text-5xl font-black text-neutral-50 uppercase`}
              >
                Welcome to
                <div className="flex items-center justify-center">
                  <span className="text-4xl md:text-6xl">Kafuffle</span>
                </div>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => (window.location.href = "/auth")}
                className="group px-8 py-4 bg-kafuffle-primary hover:opacity-90 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                Get Started Free
                <IconArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section - Discord-inspired */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built for meaningful connections
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Everything you need to stay close to the people who matter most,
              in one beautiful platform
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Real-time Messaging */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-700">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconMessage size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Real-time Chat
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Instant messaging that feels personal. Share your thoughts,
                memories, and daily moments with lightning-fast delivery.
              </p>
              <div className="mt-6 flex items-center text-rose-500 font-semibold">
                <span>Always connected</span>
                <IconArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>

            {/* Project Management */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconUsers size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Shared Spaces
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Plan adventures, track goals, and organize your dreams together.
                Collaborative tools designed for relationships.
              </p>
              <div className="mt-6 flex items-center text-purple-500 font-semibold">
                <span>Dream together</span>
                <IconArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>

            {/* Calendar */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconCalendar size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Smart Calendar
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Never miss special moments. Plan dates, track anniversaries, and
                create countdowns to your next adventure.
              </p>
              <div className="mt-6 flex items-center text-blue-500 font-semibold">
                <span>Perfect timing</span>
                <IconArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section - More professional */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why choose Kafuffle?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Built with privacy, security, and meaningful connections at its
                core
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconShield size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      Privacy First
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      End-to-end encryption ensures your conversations stay
                      between you and your loved ones. Your data, your control.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconBolt size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      Lightning Fast
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Real-time messaging with instant delivery. Feel closer
                      than ever, no matter the distance between you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconHeart size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      Made for Love
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Every feature designed to strengthen relationships and
                      create lasting memories with your favorite people.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      All-in-One Platform
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Chat, plan, and organize in one beautiful space. No more
                      juggling multiple apps to stay connected.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconUsers size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      Seamless Collaboration
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Work together effortlessly on shared goals, plans, and
                      dreams. Built for teams of two or more.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <IconHeart size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      Free to Start
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Begin your journey with our generous free plan. Meaningful
                      connections shouldn't have barriers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - More professional */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by thousands
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Join a growing community of people building deeper connections
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
                25K+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Active Users
              </div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent mb-2">
                1.2K+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Private Spaces
              </div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                5M+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Messages Sent
              </div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Uptime
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Modern and clean */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-kafuffle-primary p-12 dark:text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to connect?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Join Kafuffle today and start building deeper, more meaningful
                connections with the people who matter most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={`/auth`}
                  className={`group cursor-pointer px-10 py-5 bg-slate-900 dark:bg-white hover:bg-kafuffle-primary text-slate-50 dark:text-slate-900 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3`}
                >
                  Start Free
                  <IconArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <button
                  onClick={() => onViewChange("about")}
                  className={`cursor-pointer px-10 py-5 border-2 border-slate-900 dark:border-white/30 hover:border-kafuffle-primary hover:bg-kafuffle-primary hover:scale-105 text-slate-900 dark:text-white rounded-xl font-bold text-lg transition-all duration-300`}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

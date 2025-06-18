// /components/layout/landing-page.tsx
"use client";

import {
  IconArrowRight,
  IconCheck,
  IconMessage,
  IconTable,
  IconCalendar,
} from "@tabler/icons-react";
import KafuffleLogo from "@/components/layout/kafuffle-full-logo";

export default function LandingPage() {
  const heroBg = "hero-bg.png";

  return (
    <div
      className={`flex-grow bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-4xl h-full overflow-y-auto`}
    >
      <div className="mx-auto p-8">
        {/* Hero Section */}
        <section
          className={`relative mb-12 grid place-content-center min-h-[400px] rounded-2xl text-center border border-neutral-700 dark:border-neutral-600 overflow-hidden`}
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center 55%",
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
                className={`text-3xl md:text-4xl font-bold text-neutral-50 mb-8 flex flex-col items-center gap-4 uppercase`}
              >
                Welcome to
                <div className="flex items-center justify-center">
                  <KafuffleLogo props={{ className: "h-10 md:h-12 w-auto" }} />
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

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            Three ways to stay close to the ones you love
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Real-time Messaging */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200 dark:border-pink-800/30 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <IconMessage size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Heart-to-Heart Messages
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Share your deepest thoughts, sweetest memories, and daily
                moments with the people who matter most. Every conversation
                feels like a warm embrace.
              </p>
            </div>

            {/* Project Flows */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 dark:border-purple-800/30 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <IconTable size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Dream Boards
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Plan adventures together, track relationship goals, or organize
                your shared bucket list. Turn dreams into beautiful, achievable
                moments.
              </p>
            </div>

            {/* Calendar Integration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-800/30 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <IconCalendar size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Shared Moments
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Never miss another anniversary, plan perfect date nights, and
                create countdowns to special moments you'll treasure forever.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Kafuffle */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-3xl p-12 border border-pink-200 dark:border-pink-800/30">
            <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
              Why couples and close friends choose Kafuffle
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                      <IconCheck size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Your Private Sanctuary
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Your conversations stay completely private. Only you can
                        edit your messages, ensuring your intimate moments
                        remain sacred.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                      <IconCheck size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Instant Connection
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Messages arrive the moment you send them. Share your
                        feelings in real-time and feel closer than ever, no
                        matter the distance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                      <IconCheck size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Beautifully Yours
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Every interaction feels warm and inviting. Designed to
                        make your most precious relationships feel special and
                        celebrated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <IconCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Everything Together
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Chat, plan, and dream in one beautiful space. No more
                      switching between apps to stay connected with your
                      favorite people.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <IconCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Made for Love
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Built specifically for meaningful relationships. Every
                      feature designed to bring you closer to the people you
                      care about most.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <IconCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Free to Love
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Start connecting immediately with our generous free plan.
                      Love shouldn't come with limits or price tags.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12">
              Join thousands already connecting in their own special spaces
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Happy Hearts
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Private Spaces
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                  1M+
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Love Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  ∞
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Precious Moments
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-neutral-50 dark:bg-neutral-400 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-500/20 to-blue-500/20 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to create your perfect private space?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join Kafuffle today and start building deeper, more meaningful
                connections with the people who matter most to you.
              </p>
              <button
                onClick={() => (window.location.href = "/auth")}
                className="group px-10 py-5 bg-kafuffle-primary rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                Start Connecting
                <IconArrowRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

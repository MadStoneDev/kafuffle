import React from "react";
import {
  IconMessage,
  IconHash,
  IconCalendar,
  IconChecklist,
  IconUsers,
  IconShield,
  IconBolt,
  IconArrowRight,
  IconDeviceMobile,
  IconBrowser,
  IconCode,
} from "@tabler/icons-react";
import { View } from "@/types";
import Link from "next/link";

export default function AboutPage({
  onViewChange,
}: {
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="flex-grow bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-4xl h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white mb-6">
              How Kafuffle Works
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed">
              A modern communication platform that combines the best of
              messaging, collaboration, and planning in one seamless experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <IconBrowser
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Web Platform
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Access Kafuffle from any browser with our responsive web app
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <IconDeviceMobile
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Mobile App
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                React Native mobile app coming soon for iOS and Android
              </p>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Four Core Features
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Everything you need to communicate, collaborate, and stay
              organized with your team or loved ones
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Direct Messaging */}
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <IconMessage size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Direct Messaging
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Like WhatsApp, but better
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Message friends using <strong>usernames</strong> instead of
                    phone numbers
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Real-time messaging with instant delivery and read receipts
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    End-to-end encryption for complete privacy
                  </p>
                </div>
              </div>
            </div>

            {/* Zones */}
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center">
                  <IconHash size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Zones
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Organized group conversations
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Create themed channels similar to Discord for different
                    topics
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Organize conversations by projects, interests, or purposes
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Invite specific members to relevant zones
                  </p>
                </div>
              </div>
            </div>

            {/* Flows */}
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                  <IconChecklist size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Flows
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Kanban-style task management
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Visual task boards with customizable columns
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Drag and drop tasks between stages
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Assign tasks, set deadlines, and track progress
                  </p>
                </div>
              </div>
            </div>

            {/* Shared Calendar */}
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <IconCalendar size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Shared Calendar
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Independent scheduling
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Separate from your personal calendar apps
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Plan events, set reminders, and track important dates
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Share calendars with specific groups or individuals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-12 border border-neutral-200 dark:border-neutral-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Getting Started
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                Simple steps to start connecting and collaborating
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Create Your Account
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sign up with your email and choose a unique username. No phone
                  number required.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Connect with Friends
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Add friends by their usernames and start messaging instantly.
                  Create zones for group conversations.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Start Collaborating
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Use flows to manage tasks and share calendars to plan events
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Kafuffle is built using cutting-edge technologies for performance,
              security, and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconCode
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Next.js
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                React framework for the web application
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconDeviceMobile
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                React Native
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Cross-platform mobile app (coming soon)
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconShield
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                End-to-End Encryption
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Your messages stay private and secure
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconBolt
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                WebSocket connections for instant messaging
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconUsers
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Scalable Architecture
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Built to handle growing communities
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center">
              <IconBrowser
                size={40}
                className="text-kafuffle-primary mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Cross-Platform
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Works on any device with a web browser
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-kafuffle-primary via-neutral-900 to-black rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Kafuffle?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of users who are already connecting and
              collaborating in a whole new way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={`/auth`}
                className={`group cursor-pointer px-10 py-5 bg-slate-900 dark:bg-white hover:bg-kafuffle-primary text-slate-50 dark:text-slate-900 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3`}
              >
                Get Started Free
                <IconArrowRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <button
                onClick={() => onViewChange("help")}
                className={`cursor-pointer px-10 py-5 border-2 border-slate-900 dark:border-white/30 hover:border-kafuffle-primary hover:bg-kafuffle-primary hover:scale-105 text-slate-900 dark:text-white rounded-xl font-bold text-lg transition-all duration-300`}
              >
                Need Help?
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconMessageCircle,
  IconBug,
  IconUser,
  IconStar,
  IconArrowRight,
  IconSearch,
  IconBook,
  IconHelpCircle,
  IconSend,
} from "@tabler/icons-react";
import { View } from "@/types";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface ContactFormData {
  name: string;
  email: string;
  topic: string;
  username?: string;
  bugType?: string;
  priority?: string;
  message: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I create an account on Kafuffle?",
    answer:
      "Simply click 'Get Started Free' and sign up with your email address. Choose a unique username - no phone number required! Your username is how friends will find and message you.",
    category: "Getting Started",
  },
  {
    question: "What's the difference between direct messages and zones?",
    answer:
      "Direct messages are private conversations between you and another user, similar to WhatsApp. Zones are group channels where multiple people can chat about specific topics, similar to Discord channels.",
    category: "Features",
  },
  {
    question: "How do I add friends on Kafuffle?",
    answer:
      "You can add friends by searching for their username in the app. Once you send a friend request and they accept, you can start messaging directly.",
    category: "Getting Started",
  },
  {
    question: "What are Flows and how do I use them?",
    answer:
      "Flows are Kanban-style task boards that help you organize projects and tasks. You can create columns (like 'To Do', 'In Progress', 'Done'), add tasks as cards, and drag them between columns as work progresses.",
    category: "Features",
  },
  {
    question: "Can I use Kafuffle on my phone?",
    answer:
      "Currently, Kafuffle works great in your mobile browser. We're also developing a dedicated React Native mobile app for iOS and Android, which will be available soon!",
    category: "Technical",
  },
  {
    question: "Is my data secure on Kafuffle?",
    answer:
      "Yes! We use end-to-end encryption for all messages, ensuring only you and your intended recipients can read them. Your privacy and security are our top priorities.",
    category: "Privacy & Security",
  },
  {
    question: "How do shared calendars work?",
    answer:
      "Shared calendars in Kafuffle are separate from your personal calendar apps. You can create events, set reminders, and share specific calendars with friends or groups to coordinate plans together.",
    category: "Features",
  },
  {
    question: "Is Kafuffle free to use?",
    answer:
      "Yes! Kafuffle offers a generous free plan that includes all core features. We believe meaningful connections shouldn't have barriers.",
    category: "Pricing",
  },
];

const contactTopics = [
  { value: "feedback", label: "General Feedback", icon: IconMessageCircle },
  { value: "suggestion", label: "Feature Suggestion", icon: IconStar },
  { value: "bug", label: "Report a Bug", icon: IconBug },
  { value: "user_report", label: "Report a User", icon: IconUser },
  { value: "account", label: "Account Issues", icon: IconUser },
  { value: "other", label: "Other", icon: IconMail },
];

export default function HelpPage({
  onViewChange,
}: {
  onViewChange: (view: View) => void;
}) {
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const categories = [
    "All",
    ...Array.from(new Set(faqData.map((item) => item.category))),
  ];

  const filteredFAQ = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFormChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset conditional fields when topic changes
      ...(field === "topic" && {
        username: "",
        bugType: "",
        priority: "",
      }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      topic: "",
      message: "",
    });
  };

  const renderContactForm = () => {
    const selectedTopic = contactTopics.find((t) => t.value === formData.topic);

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            What can we help you with? *
          </label>
          <select
            required
            value={formData.topic}
            onChange={(e) => handleFormChange("topic", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
          >
            <option value="">Select a topic...</option>
            {contactTopics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional fields based on topic */}
        {formData.topic === "user_report" && (
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Username to Report *
            </label>
            <input
              type="text"
              required
              value={formData.username || ""}
              onChange={(e) => handleFormChange("username", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
              placeholder="Enter the username"
            />
          </div>
        )}

        {formData.topic === "bug" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Bug Type *
              </label>
              <select
                required
                value={formData.bugType || ""}
                onChange={(e) => handleFormChange("bugType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
              >
                <option value="">Select bug type...</option>
                <option value="messaging">Messaging Issues</option>
                <option value="zones">Zones/Channels</option>
                <option value="flows">Flows/Tasks</option>
                <option value="calendar">Calendar</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Priority *
              </label>
              <select
                required
                value={formData.priority || ""}
                onChange={(e) => handleFormChange("priority", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
              >
                <option value="">Select priority...</option>
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Affects functionality</option>
                <option value="high">High - Blocks major features</option>
                <option value="critical">Critical - App unusable</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            Message *
          </label>
          <textarea
            required
            rows={6}
            value={formData.message}
            onChange={(e) => handleFormChange("message", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all resize-none"
            placeholder={
              formData.topic === "bug"
                ? "Please describe the bug in detail. Include steps to reproduce, what you expected to happen, and what actually happened."
                : formData.topic === "user_report"
                  ? "Please describe the issue with this user. Include any relevant context or screenshots if possible."
                  : "Tell us more about your question or feedback..."
            }
          />
        </div>

        <button
          type="submit"
          className="group w-full md:w-auto px-8 py-4 bg-kafuffle-primary hover:opacity-90 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <IconSend size={20} />
          Send Message
          <IconArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </form>
    );
  };

  return (
    <div className="flex-grow bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-4xl h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support
            team
          </p>
        </section>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-neutral-800 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 inline-flex">
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "faq"
                  ? "bg-kafuffle-primary text-white shadow-lg"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <IconHelpCircle size={20} />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "contact"
                  ? "bg-kafuffle-primary text-white shadow-lg"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <IconMail size={20} />
              Contact Us
            </button>
          </div>
        </div>

        {activeTab === "faq" && (
          <>
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <div className="relative">
                  <IconSearch
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent transition-all"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-4 mb-12">
              {filteredFAQ.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div>
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-kafuffle-primary/10 text-kafuffle-primary rounded-full mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={`${expandedFAQ === index ? "" : "-rotate-180"} transition-all duration-300 ease-in-out`}
                    >
                      <IconChevronUp
                        size={24}
                        className="text-neutral-400 flex-shrink-0"
                      />
                    </div>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 py-6">
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Need more help?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                We're working on additional resources to help you get the most
                out of Kafuffle
              </p>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <IconBook
                    size={32}
                    className="text-kafuffle-primary mx-auto mb-4"
                  />
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Documentation
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Detailed guides and tutorials
                  </p>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <IconMessageCircle
                    size={32}
                    className="text-kafuffle-primary mx-auto mb-4"
                  />
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Blog
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Tips, updates, and announcements
                  </p>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("contact")}
                className="cursor-pointer mt-6 px-6 py-3 bg-kafuffle-primary hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Contact Support
              </button>
            </div>
          </>
        )}

        {activeTab === "contact" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Get in Touch
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  We'd love to hear from you. Send us a message and we'll
                  respond as soon as possible.
                </p>
              </div>

              {renderContactForm()}
            </div>

            {/* Contact Options */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {contactTopics.slice(0, 3).map((topic) => {
                const IconComponent = topic.icon;
                return (
                  <div
                    key={topic.value}
                    className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center hover:shadow-lg transition-all duration-300"
                  >
                    <IconComponent
                      size={32}
                      className="text-kafuffle-primary mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {topic.label}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {topic.value === "feedback" &&
                        "Share your thoughts and suggestions"}
                      {topic.value === "suggestion" && "Request new features"}
                      {topic.value === "bug" && "Report technical issues"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to App */}
        <div className="text-center mt-12">
          <button
            onClick={() => onViewChange("spaces")}
            className="cursor-pointer inline-flex items-center gap-2 text-kafuffle-primary hover:text-kafuffle-primary/80 font-semibold transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

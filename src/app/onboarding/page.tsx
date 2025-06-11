"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import {
  User,
  Building,
  Users,
  Code,
  Palette,
  BarChart3,
  Rocket,
  Building2,
  GraduationCap,
  Settings,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const ROLE_OPTIONS = [
  { id: "team_lead", label: "Team Lead", icon: Users },
  { id: "developer", label: "Developer", icon: Code },
  { id: "designer", label: "Designer", icon: Palette },
  { id: "project_manager", label: "Project Manager", icon: BarChart3 },
  { id: "founder", label: "Startup Founder", icon: Rocket },
  { id: "enterprise", label: "Enterprise", icon: Building2 },
  { id: "student", label: "Student/Learning", icon: GraduationCap },
  { id: "other", label: "Other", icon: Settings },
];

const TEAM_SIZE_OPTIONS = [
  { id: "solo", label: "Just me", icon: "👤" },
  { id: "small", label: "2-5 people", icon: "👥" },
  { id: "medium", label: "6-15 people", icon: "👥👥" },
  { id: "large", label: "16-50 people", icon: "🏢" },
  { id: "enterprise", label: "50+ people", icon: "🏙️" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    workspaceName: "",
    role: "",
    teamSize: "",
  });
  const supabase = createClient();
  const router = useRouter();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: formData.workspaceName,
          slug: formData.workspaceName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
          owner_id: user.id,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as workspace member
      await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      });

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          onboarding_completed: true,
          onboarding_data: {
            role: formData.role,
            team_size: formData.teamSize,
            completed_at: new Date().toISOString(),
          },
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      router.push("/projects");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.workspaceName.trim().length > 0;
      case 3:
        return formData.role.length > 0;
      case 4:
        return formData.teamSize.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {step} of 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((step / 4) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Full Name */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your name?
              </h2>
              <p className="text-gray-600 mb-8">Let's get to know you better</p>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Workspace Name */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Name your workspace
              </h2>
              <p className="text-gray-600 mb-8">
                This is where your team will collaborate
              </p>
              <input
                type="text"
                value={formData.workspaceName}
                onChange={(e) =>
                  setFormData({ ...formData, workspaceName: e.target.value })
                }
                placeholder="e.g., Acme Inc, My Team, Personal Projects"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                autoFocus
              />
            </div>
          )}

          {/* Step 3: Role */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your role?
              </h2>
              <p className="text-gray-600 mb-8">
                Help us customize your experience
              </p>
              <div className="grid grid-cols-2 gap-4">
                {ROLE_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        setFormData({ ...formData, role: option.id })
                      }
                      className={`p-4 rounded-lg border-2 transition-all hover:border-blue-300 ${
                        formData.role === option.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent
                        className={`h-8 w-8 mx-auto mb-2 ${
                          formData.role === option.id
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          formData.role === option.id
                            ? "text-blue-900"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Team Size */}
          {step === 4 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How big is your team?
              </h2>
              <p className="text-gray-600 mb-8">
                We'll optimize the experience for your team size
              </p>
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {TEAM_SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setFormData({ ...formData, teamSize: option.id })
                    }
                    className={`flex items-center p-4 rounded-lg border-2 transition-all hover:border-blue-300 ${
                      formData.teamSize === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl mr-4">{option.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        formData.teamSize === option.id
                          ? "text-blue-900"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!isStepValid() || loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

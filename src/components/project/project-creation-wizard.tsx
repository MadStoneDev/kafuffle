import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code,
  Palette,
  Users,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Settings,
  Plus,
  X,
  Check,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import type { EnhancedUser, Workspace } from "@/types";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sections: {
    name: string;
    channels: { name: string; type: "text" | "voice"; description?: string }[];
  }[];
  features: string[];
}

interface ProjectCreationWizardProps {
  user: EnhancedUser;
  workspaces: Workspace[];
  onProjectCreated: (project: any) => void;
  onClose: () => void;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "software-dev",
    name: "Software Development",
    description: "Perfect for dev teams building software products",
    icon: <Code className="w-6 h-6" />,
    color: "#3b82f6",
    sections: [
      {
        name: "💬 General",
        channels: [
          {
            name: "general",
            type: "text",
            description: "General team discussions",
          },
          {
            name: "random",
            type: "text",
            description: "Off-topic conversations",
          },
          {
            name: "announcements",
            type: "text",
            description: "Important team announcements",
          },
        ],
      },
      {
        name: "🔧 Development",
        channels: [
          {
            name: "frontend",
            type: "text",
            description: "Frontend development discussions",
          },
          {
            name: "backend",
            type: "text",
            description: "Backend & API development",
          },
          {
            name: "devops",
            type: "text",
            description: "Infrastructure and deployment",
          },
          {
            name: "code-review",
            type: "text",
            description: "Code review discussions",
          },
        ],
      },
      {
        name: "🎙️ Voice Channels",
        channels: [
          { name: "Daily Standup", type: "voice" },
          { name: "Focus Room", type: "voice" },
          { name: "Pair Programming", type: "voice" },
        ],
      },
    ],
    features: [
      "Kanban boards",
      "GitHub integration",
      "Code review workflow",
      "CI/CD notifications",
    ],
  },
  {
    id: "design-team",
    name: "Design Team",
    description: "Collaborate on design projects and creative work",
    icon: <Palette className="w-6 h-6" />,
    color: "#8b5cf6",
    sections: [
      {
        name: "🎨 Design",
        channels: [
          { name: "general", type: "text" },
          {
            name: "design-system",
            type: "text",
            description: "Design system discussions",
          },
          {
            name: "feedback",
            type: "text",
            description: "Design feedback and critiques",
          },
          {
            name: "inspiration",
            type: "text",
            description: "Design inspiration and references",
          },
        ],
      },
      {
        name: "📱 Projects",
        channels: [
          { name: "mobile-app", type: "text" },
          { name: "web-platform", type: "text" },
          { name: "branding", type: "text" },
        ],
      },
    ],
    features: [
      "Design file sharing",
      "Figma integration",
      "Version control",
      "Client feedback",
    ],
  },
  {
    id: "marketing",
    name: "Marketing Team",
    description: "Coordinate marketing campaigns and content creation",
    icon: <Briefcase className="w-6 h-6" />,
    color: "#10b981",
    sections: [
      {
        name: "📢 Marketing",
        channels: [
          { name: "general", type: "text" },
          {
            name: "campaigns",
            type: "text",
            description: "Marketing campaign planning",
          },
          {
            name: "content",
            type: "text",
            description: "Content creation and strategy",
          },
          {
            name: "analytics",
            type: "text",
            description: "Performance analytics and metrics",
          },
        ],
      },
      {
        name: "🎯 Channels",
        channels: [
          { name: "social-media", type: "text" },
          { name: "email-marketing", type: "text" },
          { name: "partnerships", type: "text" },
        ],
      },
    ],
    features: [
      "Content calendar",
      "Analytics dashboard",
      "Social media integration",
      "Campaign tracking",
    ],
  },
  {
    id: "education",
    name: "Education & Learning",
    description: "Create learning communities and manage courses",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "#f59e0b",
    sections: [
      {
        name: "📚 General",
        channels: [
          { name: "welcome", type: "text" },
          { name: "announcements", type: "text" },
          {
            name: "questions",
            type: "text",
            description: "Ask questions and get help",
          },
        ],
      },
      {
        name: "🎓 Courses",
        channels: [
          { name: "course-1", type: "text" },
          { name: "course-2", type: "text" },
          { name: "assignments", type: "text" },
        ],
      },
    ],
    features: [
      "Assignment management",
      "Grade tracking",
      "Resource sharing",
      "Student progress",
    ],
  },
  {
    id: "gaming",
    name: "Gaming Community",
    description: "Build gaming communities and organize events",
    icon: <Gamepad2 className="w-6 h-6" />,
    color: "#ef4444",
    sections: [
      {
        name: "🎮 General",
        channels: [
          { name: "general", type: "text" },
          { name: "looking-for-group", type: "text" },
          { name: "screenshots", type: "text" },
        ],
      },
      {
        name: "🎙️ Voice Channels",
        channels: [
          { name: "General Voice", type: "voice" },
          { name: "Squad 1", type: "voice" },
          { name: "Squad 2", type: "voice" },
          { name: "AFK Room", type: "voice" },
        ],
      },
    ],
    features: [
      "Event scheduling",
      "Tournament brackets",
      "Leaderboards",
      "Game integrations",
    ],
  },
  {
    id: "custom",
    name: "Custom Project",
    description: "Start from scratch with basic channels",
    icon: <Settings className="w-6 h-6" />,
    color: "#6b7280",
    sections: [
      {
        name: "General",
        channels: [
          { name: "general", type: "text" },
          { name: "random", type: "text" },
        ],
      },
    ],
    features: ["Basic setup", "Customizable structure"],
  },
];

export const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  user,
  workspaces,
  onProjectCreated,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    workspace_id: workspaces[0]?.id || "",
    visibility: "private" as "public" | "private" | "invite_only",
  });
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplate !== null;
      case 2:
        return projectData.name.trim().length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canContinue() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddInvite = () => {
    if (
      newInviteEmail.trim() &&
      !inviteEmails.includes(newInviteEmail.trim())
    ) {
      setInviteEmails([...inviteEmails, newInviteEmail.trim()]);
      setNewInviteEmail("");
    }
  };

  const handleRemoveInvite = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    try {
      const { success, project, error } =
        await DatabaseService.createProjectFromTemplate({
          ...projectData,
          owner_id: user.id,
          template: selectedTemplate,
          custom_sections:
            customSections.length > 0 ? customSections : undefined,
          invite_emails: inviteEmails,
        });

      if (success && project) {
        onProjectCreated(project);
        onClose();
      } else {
        console.error("Project creation failed:", error);
      }
    } catch (error) {
      console.error("Project creation failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const StepIndicator: React.FC<{
    step: number;
    label: string;
    isActive: boolean;
    isCompleted: boolean;
  }> = ({ step, label, isActive, isCompleted }) => (
    <div className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isCompleted
            ? "bg-kafuffle-primary text-white"
            : isActive
              ? "bg-kafuffle-primary text-white"
              : "bg-neutral-600 text-neutral-300"
        }`}
      >
        {isCompleted ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={`ml-2 text-sm font-medium ${
          isActive ? "text-white" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Create New Project
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-8 mt-6">
            <StepIndicator
              step={1}
              label="Template"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />
            <div className="flex-1 h-px bg-neutral-600" />
            <StepIndicator
              step={2}
              label="Details"
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />
            <div className="flex-1 h-px bg-neutral-600" />
            <StepIndicator
              step={3}
              label="Structure"
              isActive={currentStep === 3}
              isCompleted={currentStep > 3}
            />
            <div className="flex-1 h-px bg-neutral-600" />
            <StepIndicator
              step={4}
              label="Team"
              isActive={currentStep === 4}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Choose a Template
              </h3>
              <p className="text-neutral-400 mb-6">
                Select a template that best fits your project type
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROJECT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-opacity-60 ${
                      selectedTemplate?.id === template.id
                        ? "border-kafuffle-primary bg-kafuffle-primary/10"
                        : "border-neutral-600 hover:border-neutral-500"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: `${template.color}20`,
                        color: template.color,
                      }}
                    >
                      {template.icon}
                    </div>
                    <h4 className="font-semibold text-white mb-2">
                      {template.name}
                    </h4>
                    <p className="text-sm text-neutral-400 mb-3">
                      {template.description}
                    </p>
                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs text-neutral-500"
                        >
                          <div className="w-1 h-1 bg-kafuffle-primary rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && selectedTemplate && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Project Details
              </h3>
              <p className="text-neutral-400 mb-6">
                Configure your project settings
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) =>
                      setProjectData({ ...projectData, name: e.target.value })
                    }
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) =>
                      setProjectData({
                        ...projectData,
                        description: e.target.value,
                      })
                    }
                    placeholder="What's this project about?"
                    rows={3}
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Workspace
                    </label>
                    <select
                      value={projectData.workspace_id}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          workspace_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                    >
                      {workspaces.map((workspace) => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Visibility
                    </label>
                    <select
                      value={projectData.visibility}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          visibility: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                    >
                      <option value="private">Private - Invite only</option>
                      <option value="invite_only">
                        Invite Only - Visible to invited members
                      </option>
                      <option value="public">Public - Anyone can join</option>
                    </select>
                  </div>
                </div>

                {/* Template Preview */}
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">
                    Template Preview: {selectedTemplate.name}
                  </h4>
                  <div className="space-y-3">
                    {selectedTemplate.sections.map((section, index) => (
                      <div key={index}>
                        <h5 className="text-sm font-medium text-neutral-300 mb-1">
                          {section.name}
                        </h5>
                        <div className="ml-4 space-y-1">
                          {section.channels.map((channel, channelIndex) => (
                            <div
                              key={channelIndex}
                              className="flex items-center text-xs text-neutral-400"
                            >
                              <span className="mr-2">
                                {channel.type === "text" ? "#" : "🎙️"}
                              </span>
                              {channel.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && selectedTemplate && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Customize Structure
              </h3>
              <p className="text-neutral-400 mb-6">
                Add additional sections or channels (optional)
              </p>

              <div className="space-y-6">
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">
                    Current Structure
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedTemplate.sections.map((section, index) => (
                      <div key={index} className="text-neutral-300">
                        📁 {section.name} ({section.channels.length} channels)
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">
                    Add Custom Sections
                  </h4>
                  <button className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Invite Team Members
              </h3>
              <p className="text-neutral-400 mb-6">
                Add team members to your project (optional)
              </p>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
                    onKeyPress={(e) => e.key === "Enter" && handleAddInvite()}
                  />
                  <button
                    onClick={handleAddInvite}
                    className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {inviteEmails.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-300">
                      Invited Members
                    </h4>
                    {inviteEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-neutral-700 rounded-lg px-3 py-2"
                      >
                        <span className="text-white">{email}</span>
                        <button
                          onClick={() => handleRemoveInvite(email)}
                          className="text-neutral-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-700 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canContinue()}
                className="flex items-center px-6 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !canContinue()}
                className="flex items-center px-6 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

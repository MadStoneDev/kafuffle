import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type {
  EnhancedProject,
  EnhancedSection,
  EnhancedChannel,
  ProjectRole,
  Permission,
  EnhancedUser,
} from "@/types";

interface PermissionRule {
  resource: "project" | "section" | "channel";
  resource_id: string;
  action: "read" | "write" | "delete" | "manage" | "invite" | "moderate";
  allowed: boolean;
  inherited_from?: string;
}

interface PermissionManagerProps {
  project: EnhancedProject;
  currentUser: EnhancedUser;
  onPermissionUpdate: (rules: PermissionRule[]) => void;
}

const PERMISSION_ACTIONS = [
  {
    id: "read",
    name: "View",
    description: "Can see and read content",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: "write",
    name: "Write",
    description: "Can create and edit content",
    icon: <Edit className="w-4 h-4" />,
  },
  {
    id: "delete",
    name: "Delete",
    description: "Can delete content",
    icon: <Trash2 className="w-4 h-4" />,
  },
  {
    id: "manage",
    name: "Manage",
    description: "Can manage settings and structure",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "invite",
    name: "Invite",
    description: "Can invite new members",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "moderate",
    name: "Moderate",
    description: "Can moderate content and users",
    icon: <Shield className="w-4 h-4" />,
  },
];

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  project,
  currentUser,
  onPermissionUpdate,
}) => {
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(
    project.roles.find((r) => r.is_default) || project.roles[0] || null,
  );
  const [permissions, setPermissions] = useState<Map<string, PermissionRule[]>>(
    new Map(),
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [isEditingRole, setIsEditingRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [showCreateRole, setShowCreateRole] = useState(false);

  useEffect(() => {
    // Load permissions for selected role
    if (selectedRole) {
      loadRolePermissions(selectedRole.id);
    }
  }, [selectedRole]);

  const loadRolePermissions = async (roleId: string) => {
    // This would fetch from database in real implementation
    // For now, we'll use mock data
    const mockPermissions = new Map<string, PermissionRule[]>();

    // Project-level permissions
    mockPermissions.set(project.id, [
      {
        resource: "project",
        resource_id: project.id,
        action: "read",
        allowed: true,
      },
      {
        resource: "project",
        resource_id: project.id,
        action: "write",
        allowed: true,
      },
      {
        resource: "project",
        resource_id: project.id,
        action: "manage",
        allowed: false,
      },
    ]);

    // Section-level permissions (inherit from project unless overridden)
    project.sections.forEach((section) => {
      mockPermissions.set(section.id, [
        {
          resource: "section",
          resource_id: section.id,
          action: "read",
          allowed: true,
          inherited_from: project.id,
        },
        {
          resource: "section",
          resource_id: section.id,
          action: "write",
          allowed: true,
          inherited_from: project.id,
        },
      ]);

      // Channel-level permissions (inherit from section unless overridden)
      section.channels.forEach((channel) => {
        mockPermissions.set(channel.id, [
          {
            resource: "channel",
            resource_id: channel.id,
            action: "read",
            allowed: true,
            inherited_from: section.id,
          },
          {
            resource: "channel",
            resource_id: channel.id,
            action: "write",
            allowed: true,
            inherited_from: section.id,
          },
        ]);
      });
    });

    setPermissions(mockPermissions);
  };

  const togglePermission = (resourceId: string, action: string) => {
    const newPermissions = new Map(permissions);
    const resourcePermissions = newPermissions.get(resourceId) || [];

    const existingPermissionIndex = resourcePermissions.findIndex(
      (p) => p.action === action,
    );

    if (existingPermissionIndex >= 0) {
      // Toggle existing permission
      resourcePermissions[existingPermissionIndex] = {
        ...resourcePermissions[existingPermissionIndex],
        allowed: !resourcePermissions[existingPermissionIndex].allowed,
        inherited_from: undefined, // Override inheritance
      };
    } else {
      // Add new permission
      resourcePermissions.push({
        resource: getResourceType(resourceId),
        resource_id: resourceId,
        action: action as any,
        allowed: true,
      });
    }

    newPermissions.set(resourceId, resourcePermissions);
    setPermissions(newPermissions);
  };

  const getResourceType = (
    resourceId: string,
  ): "project" | "section" | "channel" => {
    if (resourceId === project.id) return "project";
    if (project.sections.some((s) => s.id === resourceId)) return "section";
    return "channel";
  };

  const getPermissionValue = (
    resourceId: string,
    action: string,
  ): {
    allowed: boolean;
    inherited: boolean;
    inheritedFrom?: string;
  } => {
    const resourcePermissions = permissions.get(resourceId) || [];
    const permission = resourcePermissions.find((p) => p.action === action);

    if (permission) {
      return {
        allowed: permission.allowed,
        inherited: !!permission.inherited_from,
        inheritedFrom: permission.inherited_from,
      };
    }

    // Check inheritance
    const resourceType = getResourceType(resourceId);
    if (resourceType === "channel") {
      // Check section permission
      const channel = project.sections
        .flatMap((s) => s.channels)
        .find((c) => c.id === resourceId);
      if (channel) {
        const sectionPermission = getPermissionValue(
          channel.section_id!,
          action,
        );
        if (sectionPermission.allowed !== undefined) {
          return {
            allowed: sectionPermission.allowed,
            inherited: true,
            inheritedFrom: channel.section_id,
          };
        }
      }
    }

    if (resourceType === "section" || resourceType === "channel") {
      // Check project permission
      const projectPermission = getPermissionValue(project.id, action);
      return {
        allowed: projectPermission.allowed,
        inherited: true,
        inheritedFrom: project.id,
      };
    }

    return { allowed: false, inherited: false };
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const PermissionToggle: React.FC<{
    resourceId: string;
    action: string;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = ({ resourceId, action, label, description, icon }) => {
    const permissionState = getPermissionValue(resourceId, action);

    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-700/50 transition-colors">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded ${
              permissionState.allowed
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{label}</span>
              {permissionState.inherited && (
                <span className="text-xs bg-neutral-600 text-neutral-300 px-2 py-1 rounded">
                  Inherited
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">{description}</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={permissionState.allowed}
            onChange={() => togglePermission(resourceId, action)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kafuffle-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              permissionState.allowed ? "bg-kafuffle-primary" : "bg-neutral-600"
            }`}
          ></div>
        </label>
      </div>
    );
  };

  const RoleEditor: React.FC<{ role: ProjectRole }> = ({ role }) => (
    <div className="bg-neutral-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: role.color }}
          />
          <span className="font-medium text-white">{role.name}</span>
          {role.is_default && (
            <span className="text-xs bg-kafuffle-primary text-white px-2 py-1 rounded">
              Default
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditingRole(role.id)}
            className="text-neutral-400 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!role.is_default && (
            <button className="text-neutral-400 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-neutral-400">
        {project.members.filter((m) => m.role.id === role.id).length} members
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Permission Management
        </h1>
        <p className="text-neutral-400">
          Manage roles and permissions for {project.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Roles</h2>
            <button
              onClick={() => setShowCreateRole(true)}
              className="flex items-center px-3 py-1.5 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Role
            </button>
          </div>

          <div className="space-y-2">
            {project.roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
                    ? "ring-2 ring-kafuffle-primary"
                    : ""
                }`}
              >
                <RoleEditor role={role} />
              </div>
            ))}
          </div>

          {showCreateRole && (
            <div className="bg-neutral-700 rounded-lg p-4">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name"
                className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary mb-3"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Create role logic
                    setShowCreateRole(false);
                    setNewRoleName("");
                  }}
                  className="px-3 py-1.5 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateRole(false);
                    setNewRoleName("");
                  }}
                  className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Permissions Content */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="space-y-6">
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Permissions for {selectedRole.name}
                </h3>

                {/* Project Level Permissions */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Project: {project.name}
                  </h4>
                  <div className="bg-neutral-700 rounded-lg p-4 space-y-2">
                    {PERMISSION_ACTIONS.map((action) => (
                      <PermissionToggle
                        key={`${project.id}-${action.id}`}
                        resourceId={project.id}
                        action={action.id}
                        label={action.name}
                        description={action.description}
                        icon={action.icon}
                      />
                    ))}
                  </div>
                </div>

                {/* Section Level Permissions */}
                {project.sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between text-left p-3 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                    >
                      <div className="flex items-center">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2" />
                        )}
                        <span className="font-medium text-white">
                          Section: {section.name}
                        </span>
                      </div>
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="mt-2 ml-6 space-y-4">
                        {/* Section permissions */}
                        <div className="bg-neutral-700 rounded-lg p-4 space-y-2">
                          {PERMISSION_ACTIONS.slice(0, 4).map((action) => (
                            <PermissionToggle
                              key={`${section.id}-${action.id}`}
                              resourceId={section.id}
                              action={action.id}
                              label={action.name}
                              description={action.description}
                              icon={action.icon}
                            />
                          ))}
                        </div>

                        {/* Channel permissions */}
                        {section.channels.map((channel) => (
                          <div key={channel.id} className="ml-4">
                            <h5 className="text-sm font-medium text-neutral-300 mb-2 flex items-center">
                              {channel.type === "text" ? "#" : "🎙️"}{" "}
                              {channel.name}
                            </h5>
                            <div className="bg-neutral-600 rounded-lg p-3 space-y-2">
                              {PERMISSION_ACTIONS.slice(0, 3).map((action) => (
                                <PermissionToggle
                                  key={`${channel.id}-${action.id}`}
                                  resourceId={channel.id}
                                  action={action.id}
                                  label={action.name}
                                  description={action.description}
                                  icon={action.icon}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t border-neutral-700">
                  <button
                    onClick={() => {
                      const allPermissions = Array.from(
                        permissions.values(),
                      ).flat();
                      onPermissionUpdate(allPermissions);
                    }}
                    className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Permissions
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-800 rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Select a Role
              </h3>
              <p className="text-neutral-400">
                Choose a role from the sidebar to manage its permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for bulk permission management
export const BulkPermissionManager: React.FC<{
  resources: Array<{ id: string; name: string; type: "section" | "channel" }>;
  onBulkUpdate: (
    updates: Array<{ resourceId: string; permissions: PermissionRule[] }>,
  ) => void;
}> = ({ resources, onBulkUpdate }) => {
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(),
  );
  const [bulkAction, setBulkAction] = useState<string>("");

  const handleBulkApply = () => {
    const updates = Array.from(selectedResources).map((resourceId) => ({
      resourceId,
      permissions: [
        {
          resource:
            resources.find((r) => r.id === resourceId)?.type || "channel",
          resource_id: resourceId,
          action: bulkAction,
          allowed: true,
        },
      ] as PermissionRule[],
    }));

    onBulkUpdate(updates);
    setSelectedResources(new Set());
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <h3 className="font-medium text-white mb-3">Bulk Permission Update</h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {resources.map((resource) => (
            <label
              key={resource.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedResources.has(resource.id)}
                onChange={(e) => {
                  const newSelected = new Set(selectedResources);
                  if (e.target.checked) {
                    newSelected.add(resource.id);
                  } else {
                    newSelected.delete(resource.id);
                  }
                  setSelectedResources(newSelected);
                }}
                className="rounded border-neutral-600 text-kafuffle-primary focus:ring-kafuffle-primary"
              />
              <span className="text-sm text-neutral-300">{resource.name}</span>
            </label>
          ))}
        </div>

        <div className="flex space-x-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-kafuffle-primary"
          >
            <option value="">Select action</option>
            {PERMISSION_ACTIONS.map((action) => (
              <option key={action.id} value={action.id}>
                {action.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleBulkApply}
            disabled={selectedResources.size === 0 || !bulkAction}
            className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

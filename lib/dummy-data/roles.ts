export const space_roles = [
  {
    id: "role-owner-1234-5678-9abc-def123456789",
    name: "Owner",
    description: "Full control over the space",
    color: "#ff6b6b",
    position: 0,
    is_default: false,
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
  },
  {
    id: "role-admin-2345-6789-abcd-ef1234567890",
    name: "Admin",
    description: "Can manage most aspects of the space",
    color: "#4ecdc4",
    position: 1,
    is_default: false,
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
  },
  {
    id: "role-mod-3456-789a-bcde-f12345678901",
    name: "Moderator",
    description: "Can moderate content and manage users",
    color: "#45b7d1",
    position: 2,
    is_default: false,
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
  },
  {
    id: "role-family-4567-89ab-cdef-123456789012",
    name: "Family Member",
    description: "Full family member with access to all areas",
    color: "#96ceb4",
    position: 3,
    is_default: true,
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
  },
  {
    id: "role-guest-5678-9abc-def1-234567890123",
    name: "Guest",
    description: "Limited access for visiting family",
    color: "#feca57",
    position: 4,
    is_default: false,
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
  },
  {
    id: "role-wed-owner-6789-abcd-ef12-345678901234",
    name: "Couple",
    description: "The engaged couple planning the wedding",
    color: "#ff9ff3",
    position: 0,
    is_default: false,
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
  },
  {
    id: "role-wed-planner-789a-bcde-f123-456789012345",
    name: "Wedding Planner",
    description: "Professional wedding planner with full access",
    color: "#f38ba8",
    position: 1,
    is_default: false,
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
  },
  {
    id: "role-wed-family-89ab-cdef-1234-567890123456",
    name: "Family & Close Friends",
    description: "Trusted family and friends helping with planning",
    color: "#fab387",
    position: 2,
    is_default: true,
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
  },
  {
    id: "role-wed-vendor-9abc-def1-2345-678901234567",
    name: "Vendor",
    description: "Wedding vendors with limited access",
    color: "#f9e2af",
    position: 3,
    is_default: false,
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
  },
];

export const space_permissions = [
  {
    id: "perm-manage-space-1234-5678-9abc-def123456789",
    name: "manage_space",
    description: "Can modify space settings, name, description",
    category: "space_management",
  },
  {
    id: "perm-invite-users-2345-6789-abcd-ef1234567890",
    name: "invite_users",
    description: "Can invite new users to the space",
    category: "user_management",
  },
  {
    id: "perm-kick-users-3456-789a-bcde-f12345678901",
    name: "kick_users",
    description: "Can remove users from the space",
    category: "user_management",
  },
  {
    id: "perm-ban-users-4567-89ab-cdef-123456789012",
    name: "ban_users",
    description: "Can ban users from the space",
    category: "user_management",
  },
  {
    id: "perm-manage-roles-5678-9abc-def1-234567890123",
    name: "manage_roles",
    description: "Can create, edit, and assign roles",
    category: "role_management",
  },
  {
    id: "perm-manage-categories-6789-abcd-ef12-345678901234",
    name: "manage_categories",
    description: "Can create, edit, and delete categories",
    category: "content_management",
  },
  {
    id: "perm-manage-zones-789a-bcde-f123-456789012345",
    name: "manage_zones",
    description: "Can create, edit, and delete zones",
    category: "content_management",
  },
  {
    id: "perm-view-zones-89ab-cdef-1234-567890123456",
    name: "view_zones",
    description: "Can view zones (basic access)",
    category: "basic_access",
  },
  {
    id: "perm-send-messages-9abc-def1-2345-678901234567",
    name: "send_messages",
    description: "Can send messages in zones",
    category: "messaging",
  },
  {
    id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
    name: "delete_own_messages",
    description: "Can delete their own messages",
    category: "messaging",
  },
  {
    id: "perm-delete-any-messages-bcde-f123-4567-890123456789",
    name: "delete_any_messages",
    description: "Can delete any messages in the space",
    category: "moderation",
  },
  {
    id: "perm-pin-messages-cdef-1234-5678-901234567890",
    name: "pin_messages",
    description: "Can pin/unpin messages",
    category: "moderation",
  },
  {
    id: "perm-upload-files-def1-2345-6789-012345678901",
    name: "upload_files",
    description: "Can upload files and media",
    category: "messaging",
  },
  {
    id: "perm-mention-everyone-ef12-3456-789a-123456789012",
    name: "mention_everyone",
    description: "Can use @everyone and @here mentions",
    category: "messaging",
  },
  {
    id: "perm-create-events-f123-4567-89ab-234567890123",
    name: "create_events",
    description: "Can create and manage events",
    category: "events",
  },
  {
    id: "perm-manage-events-1234-5678-9abc-345678901234",
    name: "manage_events",
    description: "Can edit and delete any events",
    category: "events",
  },
];

export const role_permissions = [
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-manage-space-1234-5678-9abc-def123456789",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-invite-users-2345-6789-abcd-ef1234567890",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-kick-users-3456-789a-bcde-f12345678901",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-ban-users-4567-89ab-cdef-123456789012",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-manage-roles-5678-9abc-def1-234567890123",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-manage-categories-6789-abcd-ef12-345678901234",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-manage-zones-789a-bcde-f123-456789012345",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-view-zones-89ab-cdef-1234-567890123456",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-send-messages-9abc-def1-2345-678901234567",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-delete-any-messages-bcde-f123-4567-890123456789",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-pin-messages-cdef-1234-5678-901234567890",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-upload-files-def1-2345-6789-012345678901",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-mention-everyone-ef12-3456-789a-123456789012",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-create-events-f123-4567-89ab-234567890123",
  },
  {
    role_id: "role-owner-1234-5678-9abc-def123456789",
    permission_id: "perm-manage-events-1234-5678-9abc-345678901234",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-invite-users-2345-6789-abcd-ef1234567890",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-kick-users-3456-789a-bcde-f12345678901",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-manage-categories-6789-abcd-ef12-345678901234",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-manage-zones-789a-bcde-f123-456789012345",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-view-zones-89ab-cdef-1234-567890123456",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-send-messages-9abc-def1-2345-678901234567",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-delete-any-messages-bcde-f123-4567-890123456789",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-pin-messages-cdef-1234-5678-901234567890",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-upload-files-def1-2345-6789-012345678901",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-mention-everyone-ef12-3456-789a-123456789012",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-create-events-f123-4567-89ab-234567890123",
  },
  {
    role_id: "role-admin-2345-6789-abcd-ef1234567890",
    permission_id: "perm-manage-events-1234-5678-9abc-345678901234",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-view-zones-89ab-cdef-1234-567890123456",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-send-messages-9abc-def1-2345-678901234567",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-delete-any-messages-bcde-f123-4567-890123456789",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-pin-messages-cdef-1234-5678-901234567890",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-upload-files-def1-2345-6789-012345678901",
  },
  {
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    permission_id: "perm-create-events-f123-4567-89ab-234567890123",
  },
  {
    role_id: "role-family-4567-89ab-cdef-123456789012",
    permission_id: "perm-view-zones-89ab-cdef-1234-567890123456",
  },
  {
    role_id: "role-family-4567-89ab-cdef-123456789012",
    permission_id: "perm-send-messages-9abc-def1-2345-678901234567",
  },
  {
    role_id: "role-family-4567-89ab-cdef-123456789012",
    permission_id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
  },
  {
    role_id: "role-family-4567-89ab-cdef-123456789012",
    permission_id: "perm-upload-files-def1-2345-6789-012345678901",
  },
  {
    role_id: "role-family-4567-89ab-cdef-123456789012",
    permission_id: "perm-create-events-f123-4567-89ab-234567890123",
  },
  {
    role_id: "role-guest-5678-9abc-def1-234567890123",
    permission_id: "perm-view-zones-89ab-cdef-1234-567890123456",
  },
  {
    role_id: "role-guest-5678-9abc-def1-234567890123",
    permission_id: "perm-send-messages-9abc-def1-2345-678901234567",
  },
  {
    role_id: "role-guest-5678-9abc-def1-234567890123",
    permission_id: "perm-delete-own-messages-abcd-ef12-3456-789012345678",
  },
];

export const user_space_roles = [
  {
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
    role_id: "role-owner-1234-5678-9abc-def123456789",
    assigned_at: "2025-07-15T10:00:00.000Z",
    assigned_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  },
  {
    user_id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
    role_id: "role-family-4567-89ab-cdef-123456789012",
    assigned_at: "2025-07-16T14:30:00.000Z",
    assigned_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  },
  {
    user_id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    space_id: "space-1a2b-3c4d-5e6f-789012345678",
    role_id: "role-family-4567-89ab-cdef-123456789012",
    assigned_at: "2025-07-17T09:15:00.000Z",
    assigned_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  },
  {
    user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
    role_id: "role-wed-owner-6789-abcd-ef12-345678901234",
    assigned_at: "2025-06-01T12:00:00.000Z",
    assigned_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  },
  {
    user_id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    space_id: "space-2b3c-4d5e-6f7g-890123456789",
    role_id: "role-wed-owner-6789-abcd-ef12-345678901234",
    assigned_at: "2025-06-01T12:00:00.000Z",
    assigned_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  },
];

export const category_permissions = [
  {
    id: "cat-perm-1234-5678-9abc-def123456789",
    category_id: "cat-fam1-2345-6789-abcd-ef1234567890",
    permission_type: "view_zones",
    role_id: "role-family-4567-89ab-cdef-123456789012",
    allowed: true,
  },
  {
    id: "cat-perm-2345-6789-abcd-ef1234567890",
    category_id: "cat-fam1-2345-6789-abcd-ef1234567890",
    permission_type: "send_messages",
    role_id: "role-family-4567-89ab-cdef-123456789012",
    allowed: true,
  },
  {
    id: "cat-perm-3456-789a-bcde-f12345678901",
    category_id: "cat-fam1-2345-6789-abcd-ef1234567890",
    permission_type: "send_messages",
    role_id: "role-guest-5678-9abc-def1-234567890123",
    allowed: false,
  },
  {
    id: "cat-perm-4567-89ab-cdef-123456789012",
    category_id: "cat-fam2-3456-789a-bcde-f12345678901",
    permission_type: "view_zones",
    role_id: "role-guest-5678-9abc-def1-234567890123",
    allowed: false,
  },
];

export const zone_permissions = [
  {
    id: "zone-perm-1234-5678-9abc-def123456789",
    zone_id: "zone-fam2-2345-6789-abcd-ef1234567890",
    permission_type: "send_messages",
    role_id: "role-family-4567-89ab-cdef-123456789012",
    allowed: false,
    overrides_category: true,
    note: "Announcements zone - only moderators and admins can post",
  },
  {
    id: "zone-perm-2345-6789-abcd-ef1234567890",
    zone_id: "zone-fam2-2345-6789-abcd-ef1234567890",
    permission_type: "send_messages",
    role_id: "role-mod-3456-789a-bcde-f12345678901",
    allowed: true,
    overrides_category: true,
    note: "Moderators can post announcements",
  },
  {
    id: "zone-perm-3456-789a-bcde-f12345678901",
    zone_id: "zone-fam5-5678-9abc-def1-234567890123",
    permission_type: "upload_files",
    role_id: "role-guest-5678-9abc-def1-234567890123",
    allowed: true,
    overrides_category: false,
    note: "Guests can upload photos to family photo sharing",
  },
];

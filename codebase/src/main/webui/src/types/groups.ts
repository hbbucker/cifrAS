export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface GroupData {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  role?: 'Admin' | 'Member';
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  email: string;
  name: string;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName?: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt?: string;
}

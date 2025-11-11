import { Role } from '@prisma/client';
import { create } from 'zustand';

export type Member = {
    id: string;
    userId: string;
    role: Role;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

type MemberStore = {
    members: Member[];
    addMember: (member: Member) => void;
    removeMember: (id: string) => void;
    updateMember: (id: string, updates: Partial<Member>) => void;
    setMembers: (members: Member[]) => void;
}

export const useMemberStore = create<MemberStore>((set) => ({
    members: [],
    addMember: (member: Member) => set((state) => ({ members: [...state.members, member] })),
    removeMember: (id: string) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
    updateMember: (id: string, updates: Partial<Member>) => set((state) => ({
        members: state.members.map((m) => m.id === id ? { ...m, ...updates } : m)
    })),
    setMembers: (members: Member[]) => set({ members }),
}));


"use client"

import React, { useEffect } from 'react'

import { createMembersColumns } from './members-columns';
import { Project, User, Membership } from '@prisma/client';
import { MembersDataTable } from './MembersDataTable';
import AddMemberButton from '@/components/project/AddMemberButton';
import { useMemberStore } from '@/store/MemberStore';

type ProjectWithMemberships = Project & {
    memberships: (Membership & {
        user: User;
    })[];
    currentUserRole: string;
};

const MembersContainer = ({project}: {project: ProjectWithMemberships}) => {
    const { members, setMembers } = useMemberStore();

    // Initialize the store with members from the server
    useEffect(() => {
        const initialMembers = project.memberships.map((membership) => ({
            id: membership.id,
            userId: membership.userId,
            role: membership.role,
            user: membership.user
        }));
        setMembers(initialMembers);
    }, [project.memberships, setMembers]);

    const canEdit = project.currentUserRole === 'ADMIN' || project.currentUserRole === 'EDITOR';
    
    const allColumns = createMembersColumns(project.id);
    const visibleColumns = canEdit 
        ? allColumns 
        : allColumns.filter(col => col.id !== 'actions'); 
    
     return (
        <div className="space-y-4">
            <div className="flex items-center justify-between my-2">
                <h2 className="text-2xl font-bold">Members</h2>
                {/* TODO: Add invite member button */}
                {canEdit && <AddMemberButton projectId={project.id} />}
            </div>
            <MembersDataTable columns={visibleColumns} data={members} />
        </div>
    )
}

export default MembersContainer;

import React, { useTransition } from 'react'

import { membersColumns } from './members-columns';
import { Project, User, Membership } from '@/generated/prisma/client';
import { MembersDataTable } from './MembersDataTable';
import AddMemberButton from '@/components/project/AddMemberButton';

type ProjectWithMemberships = Project & {
    memberships: (Membership & {
        user: User;
    })[];
    currentUserRole: string;
};

const MembersContainer = ({project}: {project: ProjectWithMemberships}) => {

    const members = project.memberships.map((membership) => ({
        id: membership.id,
        userId: membership.userId,
        role: membership.role,
        user: membership.user
    })) || []

    const canEdit = project.currentUserRole === 'ADMIN' || project.currentUserRole === 'EDITOR';

    const visibleColumns = canEdit 
        ? membersColumns 
        : membersColumns.filter(col => col.id !== 'actions'); 
    
     return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Members</h2>
                {/* TODO: Add invite member button */}
                {canEdit && <AddMemberButton projectId={project.id} />}
            </div>
            <MembersDataTable columns={visibleColumns} data={members} />
        </div>
    )
}

export default MembersContainer;

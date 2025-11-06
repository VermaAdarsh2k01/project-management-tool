import React, { useTransition } from 'react'

import { membersColumns, MemberData } from './members-columns';
import { Project as PrismaProject, User, Membership } from '@/generated/prisma/client';
import { MembersDataTable } from './MembersDataTable';
import AddMemberButton from '@/components/project/AddMemberButton';

type ProjectWithMemberships = PrismaProject & {
    memberships: (Membership & {
        user: User;
    })[];
};

const MembersContainer = ({project}: {project: ProjectWithMemberships}) => {

    const members = project.memberships.map((membership) => ({
        id: membership.id,
        userId: membership.userId,
        role: membership.role,
        user: membership.user
    })) || []

     return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Members</h2>
                {/* TODO: Add invite member button */}
                <AddMemberButton projectId={project.id} />
            </div>
            <MembersDataTable columns={membersColumns} data={members} />
        </div>
    )
}

export default MembersContainer;

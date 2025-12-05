"use client"

import React, { useEffect } from 'react'

import { createMembersColumns } from './members-columns';
import { MembersDataTable } from './MembersDataTable';
import AddMemberButton from '@/components/project/AddMemberButton';
import { useMemberStore, Member } from '@/store/MemberStore';

interface MembersContainerProps {
    membersData: Member[];
    currentUserRole: string;
    projectId: string;
}

const MembersContainer = ({membersData, currentUserRole, projectId}: MembersContainerProps) => {
    const { members, setMembers } = useMemberStore();

    // Initialize the store with members from the server
    useEffect(() => {
        setMembers(membersData);
    }, [membersData, setMembers]);

    const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'EDITOR';
    
    const allColumns = createMembersColumns(projectId);
    const visibleColumns = canEdit 
        ? allColumns 
        : allColumns.filter(col => col.id !== 'actions'); 
    
     return (
        <div className="space-y-4">
            <div className="flex items-center justify-between my-2">
                <h2 className="text-2xl font-bold">Members</h2>
                {canEdit && <AddMemberButton projectId={projectId} />}
            </div>
            <MembersDataTable columns={visibleColumns} data={members} />
        </div>
    )
}

export default MembersContainer;

"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@prisma/client";
import { User, Crown, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal, ModalTrigger, ModalBody, ModalContent, useModal } from "../ui/animated-modal";
import ChangeMemberRoleForm from "./ChangeMemberRoleForm";
import { removeMember } from "@/app/actions/Membership";
import { toast } from "sonner";
import { useMemberStore } from "@/store/MemberStore";
import { useTransition } from "react";

export type MemberData = {
  id: string;
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

const RoleIcons = {
  "ADMIN": <Crown className="w-4 h-4 text-yellow-600" />,
  "EDITOR": <Edit className="w-4 h-4 text-blue-600" />,
  "VIEWER": <Eye className="w-4 h-4 text-gray-600" />,
}

const RoleLabels = {
  "ADMIN": "Admin",
  "EDITOR": "Editor", 
  "VIEWER": "Viewer",
}

const RoleColors = {
  "ADMIN": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "EDITOR": "bg-blue-100 text-blue-800 border-blue-200",
  "VIEWER": "bg-gray-100 text-gray-800 border-gray-200",
}

// Component to handle the member actions with modal
const MemberActionsCell = ({ member, projectId }: { member: MemberData; projectId: string }) => {
  const { removeMember: removeMemberFromStore, addMember } = useMemberStore();
  const [isPending, startTransition] = useTransition();

  const handleRemoveMember = () => {
    // Store the member data for potential rollback
    const memberToRemove = { ...member };
    
    // Optimistic update - immediately remove from UI
    removeMemberFromStore(member.id);
    
    startTransition(async () => {
      try {
        await removeMember(member.id, projectId);
        toast.success("Member removed successfully");
      } catch (error) {
        console.error("Error removing member:", error);
        addMember(memberToRemove);
        toast.error("Failed to remove member");
      }
    });
  };

  return (
    <Modal>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ChangeRoleMenuItem member={member} projectId={projectId} />
          <DropdownMenuItem
            className="text-red-600"
            onClick={handleRemoveMember}
            disabled={isPending}
          >
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModalBody>
        <ModalContent>
          <ChangeMemberRoleForm member={member} projectId={projectId} />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

// Separate component for the Change Role menu item that can access modal context
const ChangeRoleMenuItem = ({ member, projectId }: { member: MemberData; projectId: string }) => {
  const { setOpen } = useModal();
  
  return (
    <DropdownMenuItem onClick={() => setOpen(true)}>
      Change Role
    </DropdownMenuItem>
  );
};

export const createMembersColumns = (projectId: string): ColumnDef<MemberData>[] => [
  {
    header: "Member",
    accessorKey: "user",
    size: 300,
    cell: ({ row }) => {
      const user = row.getValue("user") as MemberData["user"];
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || "Unknown User"}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    }
  },
  {
    header: "Role",
    accessorKey: "role",
    size: 150,
    cell: ({ row }) => {
      const role = row.getValue("role") as Role;
      return (
        <div className="inline-flex items-center gap-2">
          <div className={`px-2 py-1 rounded-md border text-xs font-medium ${RoleColors[role]}`}>
            <div className="flex items-center gap-1">
              {RoleIcons[role]}
              <span>{RoleLabels[role]}</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      const member = row.original;
      
      return <MemberActionsCell member={member} projectId={projectId} />;
    },
  },
]

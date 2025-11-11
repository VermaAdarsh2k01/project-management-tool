"use client"

import React, { startTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Role } from '@prisma/client'
import { useModal } from '../ui/animated-modal'
import { ChevronDown, Crown, Edit, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { MemberData } from './members-columns'
import { updateMemberRole } from '@/app/actions/Membership'
import { useMemberStore } from '@/store/MemberStore'

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

const RoleDescriptions = {
  "ADMIN": "Full access to project settings and member management",
  "EDITOR": "Can edit project content and manage tasks",
  "VIEWER": "Can view project content but cannot make changes",
}

interface ChangeMemberRoleFormProps {
  member: MemberData;
  projectId: string;
}

const ChangeMemberRoleForm = ({ member, projectId }: ChangeMemberRoleFormProps) => {
  const [selectedRole, setSelectedRole] = useState<Role>(member.role)
  const [isLoading, setIsLoading] = useState(false)
  const modal = useModal()
  const { updateMember: updateMemberInStore } = useMemberStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRole === member.role) {
      toast.info('No changes made to member role')
      modal.setOpen(false)
      return
    }

    setIsLoading(true)
    
    const originalRole = member.role

    updateMemberInStore(member.id, { role: selectedRole })

    modal.setOpen(false)

    startTransition(async () => {
      try {
        await updateMemberRole(member.id, projectId, selectedRole)
        toast.success(`Successfully updated ${member.user.name || member.user.email}'s role to ${RoleLabels[selectedRole]}`)
      } 
      catch (error) {
        console.error("Error updating member role:", error)
        updateMemberInStore(member.id, { role: originalRole })
        toast.error("Failed to update member role")
      }
    })
  }

  const availableRoles: Role[] = ['VIEWER', 'EDITOR', 'ADMIN']

  return (
    <div className="p-6" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Change Member Role</h2>
        <p className="text-sm text-muted-foreground">
          Update the role for {member.user.name || member.user.email}
        </p>
      </div>
      
      {/* Current Member Info */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Eye className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{member.user.name || "Unknown User"}</div>
            <div className="text-sm text-muted-foreground">{member.user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current role:</span>
          <div className="flex items-center gap-1">
            {RoleIcons[member.role]}
            <span className="text-sm font-medium">{RoleLabels[member.role]}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">New Role</Label>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-between w-full gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {RoleIcons[selectedRole]}
                    <span>{RoleLabels[selectedRole]}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full min-w-[300px]">
              {availableRoles.map((role) => (
                <DropdownMenuItem 
                  key={role}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setSelectedRole(role); 
                  }}
                  className={selectedRole === role ? 'bg-accent' : ''}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      {RoleIcons[role]}
                      <span className="font-medium">{RoleLabels[role]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {RoleDescriptions[role]}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {selectedRole !== member.role && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Role Change:</strong> {RoleLabels[member.role]} → {RoleLabels[selectedRole]}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              {RoleDescriptions[selectedRole]}
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => modal.setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || selectedRole === member.role}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChangeMemberRoleForm

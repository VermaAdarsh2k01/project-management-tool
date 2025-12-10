"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import emailjs from '@emailjs/browser'
import { sendInvitation , createInvitationRecord} from '@/app/actions/Invite'

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

const InviteMemberForm = ({projectId}: {projectId: string}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('VIEWER')
  const [isLoading, setIsLoading] = useState(false)
  const modal = useModal()

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
    } else {
      toast.error('EmailJS public key is missing');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await sendInvitation(email, role, projectId);

      if (!result.success) {
        throw new Error('Failed to process invitation');
      }

      const emailResult = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        result.emailData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      await createInvitationRecord(result.invitationData);

      toast.success('Invitation sent successfully')
      
      modal.setOpen(false)
      
      setEmail('')
      setRole('VIEWER')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation'
      toast.error(errorMessage) 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Invite Member</h2>
        <p className="text-sm text-muted-foreground">
          Send an invitation to add a new member to this project.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-between w-full gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {RoleIcons[role]}
                  <span>{RoleLabels[role]}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRole('VIEWER'); }}>
                <div className="flex items-center gap-2">
                  {RoleIcons['VIEWER']}
                  <span>Viewer</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRole('EDITOR'); }}>
                <div className="flex items-center gap-2">
                  {RoleIcons['EDITOR']}
                  <span>Editor</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRole('ADMIN'); }}>
                <div className="flex items-center gap-2">
                  {RoleIcons['ADMIN']}
                  <span>Admin</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => modal.setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !email}>
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default InviteMemberForm

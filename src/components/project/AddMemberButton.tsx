"use client"

import React from 'react'
import { PlusIcon } from 'lucide-react'
import { Modal, ModalContent, ModalTrigger, ModalBody } from '../ui/animated-modal'
import InviteMemberForm from './InviteMemberForm'

const AddMemberButton = ({projectId}: {projectId: string}) => {
  return (
    <Modal>
      <ModalTrigger className='flex items-center gap-2 justify-center rounded-lg border bg-muted-foreground px-3 py-1'>
        <PlusIcon className='w-4 h-4 text-neutral-900' />
        <h4 className="text-lg md:text-sm text-neutral-600 dark:text-neutral-900 text-center font-medium">
          Add Member
        </h4>
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <InviteMemberForm projectId={projectId}/>
        </ModalContent>
      </ModalBody>
    </Modal>
  )
}

export default AddMemberButton

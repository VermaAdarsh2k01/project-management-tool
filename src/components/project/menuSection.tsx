
import React from 'react'

import { PlusIcon } from 'lucide-react'
import { Modal, ModalContent, ModalTrigger , ModalBody} from '../ui/animated-modal'
import ProjectForm from './ProjectForm'

const MenuSection = () => {
  return (
    <div className='flex items-center justify-center'>
        <Modal >
            <ModalTrigger className='flex items-center gap-2 justify-center rounded-lg border bg-muted-foreground px-3 py-1'>
                <PlusIcon className='w-4 h-4 text-neutral-900' />
                <h4 className="text-lg md:text-sm text-neutral-600 dark:text-neutral-900 text-center font-medium">
                    New Project{" "}
                </h4>
            </ModalTrigger>
            <ModalBody>
                <ModalContent>
                    <ProjectForm />
                </ModalContent>
            </ModalBody>
        </Modal>
    </div>
  )
}

export default MenuSection

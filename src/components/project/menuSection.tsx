
import React from 'react'

import { PlusIcon } from 'lucide-react'
import { Modal, ModalContent, ModalTrigger , ModalBody} from '../ui/animated-modal'
import ProjectForm from './ProjectForm'

const MenuSection = () => {
  return (
    <div className='flex items-center justify-center'>
        <Modal >
            <ModalTrigger className='flex items-center gap-2 justify-center rounded-lg border border-gray-400 dark:border-neutral-500 px-4 py-2'>
                <PlusIcon className='w-4 h-4' />
                <h4 className="text-lg md:text-base text-neutral-600 dark:text-neutral-100 font-semibold text-center">
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

"use client"
import React from 'react'

import { PlusIcon } from 'lucide-react'
import { Modal, ModalContent, ModalTrigger , ModalBody} from '../ui/animated-modal'
import ProjectForm from './ProjectForm'

const MenuSection = () => {
  return (
    <div className='flex items-center justify-center'>
        <Modal>
            <ModalTrigger>
                <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                    New Project{" "}
                <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                </span>{" "}
                <PlusIcon className='w-4 h-4' />
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

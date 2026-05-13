import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export const useCreateWorkspaceForm = ({ isOpen }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { title: '', description: '' }
  })

  useEffect(() => {
    if (isOpen) {
      reset({ title: '', description: '' })
    }
  }, [isOpen, reset])

  return {
    register,
    errors,
    handleSubmit
  }
}

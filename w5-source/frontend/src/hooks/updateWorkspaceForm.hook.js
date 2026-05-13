import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export const useUpdateWorkspaceForm = ({ isOpen, data }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        title: data?.title || '',
        description: data?.description || ''
      })
    }
  }, [data, isOpen, reset])

  return {
    register,
    errors,
    handleSubmit
  }
}

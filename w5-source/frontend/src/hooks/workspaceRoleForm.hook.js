import { useForm } from 'react-hook-form'

export function useCreateWorkspaceRoleForm({ handleCreate, onClose }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      permissionCodes: []
    }
  })

  const selectedPermissions = watch('permissionCodes') || []

  const handleClose = () => {
    reset()
    onClose?.()
  }

  const onSubmit = async (data) => {
    await handleCreate?.(data)
    handleClose()
  }

  return {
    register,
    handleSubmit,
    errors,
    selectedPermissions,
    handleClose,
    onSubmit
  }
}

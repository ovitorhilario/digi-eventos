import { useEffect } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { getUsersByIdQueryKey, useGetUsersById, usePutUsersById, type PutUsersByIdMutationRequest } from '@/http/gen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/page-header'
import { toastManager } from '@/components/ui/toast'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUploadField } from '@/components/image-upload-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserChangePasswordDialog } from '@/components/user-change-password-dialog'

type EditProfileForm = {
  name: string
  email: string
  avatar?: File | null
}

export const Route = createFileRoute('/app/perfil/editar/self')({
  component: EditarPerfilComponent,
})

function EditarPerfilComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const { user: currentUser, setUser } = useAuth()
  const userId = currentUser?.id

  // Redirect if not authenticated
  useEffect(() => {
    if (!userId) {
      navigate({ to: '/auth/sign-in' })
    }
  }, [userId, navigate])

  const { data: user, isLoading } = useGetUsersById(userId || '')
  const updateUserMutation = usePutUsersById()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
    } as EditProfileForm,
    onSubmit: async ({ value }) => {
      if (!userId) {
        toastManager.add({
          type: 'error',
          title: 'Erro',
          description: 'Usuário não autenticado.'
        })
        return
      }

      try {
        // Validação básica
        if (!value.name.trim()) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Nome é obrigatório.'
          })
          return
        }

        if (!value.email.trim()) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Email é obrigatório.'
          })
          return
        }

        // Preparar dados para atualização
        const updateData: PutUsersByIdMutationRequest = {}

        // Adicionar apenas campos que foram fornecidos e são válidos
        if (value.name.trim()) {
          updateData.name = value.name
        }

        if (value.email.trim()) {
          updateData.email = value.email
        }

        // Processar avatar se fornecido
        if (value.avatar === null) {
          // Remover avatar atual
          updateData.avatar = null
        } else if (value.avatar instanceof File) {
          const avatarFile = value.avatar as File
          const base64Avatar = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(avatarFile)
          })
          updateData.avatar = base64Avatar
        }

        const response = await updateUserMutation.mutateAsync({
          id: userId,
          data: updateData
        })

        setUser({
          ...currentUser,
          name: response.name,
          email: response.email,
          avatarUrl: response.avatarUrl,
        })

        queryClient.invalidateQueries({ 
          queryKey: getUsersByIdQueryKey(userId)
        })

        toastManager.add({
          type: 'success',
          title: 'Perfil atualizado',
          description: 'Seu perfil foi atualizado com sucesso.'
        })

        if (router.history.canGoBack()) {
          router.history.back()
        }

      } catch (error) {
        toastManager.add({
          type: 'error',
          title: 'Erro ao atualizar perfil',
          description: 'Tente novamente mais tarde.'
        })
      }
    },
  })

  // Atualizar valores do form quando o usuário carregar
  useEffect(() => {
    if (user) {
      form.setFieldValue('name', user.name)
      form.setFieldValue('email', user.email)
    }
  }, [user, form])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h1>
          <Button onClick={() => navigate({ to: '/app/perfil/$userId', params: { userId: userId || '' } })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao perfil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title='Editar perfil'
        description='Atualize suas informações de perfil'
      />

      <div className="rounded-lg shadow-sm border p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              {user.avatarUrl && (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name}
                />
              )}
              <AvatarFallback className="text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">Foto de Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Atualize sua foto de perfil (opcional)
              </p>
            </div>
          </div>

          {/* Avatar Upload */}
          <form.Field name="avatar">
            {(field) => (
              <ImageUploadField
                field={field}
                label="Nova foto de perfil"
                description="Selecione uma nova imagem para seu perfil (opcional)"
                maxSizeMB={2}
              />
            )}
          </form.Field>

          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim().length < 2
                  ? 'Nome deve ter pelo menos 2 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <Label>
                  Nome
                </Label>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Seu nome completo"
                  className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Email inválido'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <Label>
                  Email
                </Label>
                <Input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="seu@email.com"
                  className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <UserChangePasswordDialog 
              userId={userId || ''}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/app/dashboard' })}
              >
                Cancelar
              </Button>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

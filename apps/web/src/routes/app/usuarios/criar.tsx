import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { usePostUsers } from '@/http/gen'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploadField } from "@/components/image-upload-field"
import { PageHeader } from "@/components/page-header"
import { toastManager } from "@/components/ui/toast"
import { useQueryClient } from '@tanstack/react-query'
import { getUsersQueryKey } from '@/http/gen'
import { useAuth } from '@/context/auth'

type CreateUserForm = {
  name: string
  email: string
  password: string
  role: 'user' | 'admin' | 'owner'
  avatar?: File | null
}

export const Route = createFileRoute('/app/usuarios/criar')({
  component: CreateUserComponent,
})

function CreateUserComponent() {
  const navigate = useNavigate()
  const createUserMutation = usePostUsers()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  // Filtrar roles disponíveis baseado no role do usuário atual
  const availableRoles = currentUser?.role === 'owner'
    ? [
        { label: "Usuário", value: "user" },
        { label: "Administrador", value: "admin" },
      ]
    : [
        { label: "Usuário", value: "user" },
      ]

  // Definir valor padrão baseado no role do usuário
  const defaultRole = currentUser?.role === 'owner' 
    ? 'user' as 'user' | 'admin' | 'owner' : 'user'

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: defaultRole,
      avatar: null,
    } as CreateUserForm,
    onSubmit: async ({ value }) => {
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

        if (!value.password.trim()) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Senha é obrigatória.'
          })
          return
        }

        if (value.password.length < 6) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'A senha deve ter pelo menos 6 caracteres.'
          })
          return
        }

        // Preparar dados para criação
        const createData: any = {
          name: value.name.trim(),
          email: value.email.trim(),
          password: value.password,
          role: value.role,
        }

        // Processar avatar se fornecido
        if (value.avatar instanceof File) {
          const base64Avatar = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            if (value.avatar) {
              reader.readAsDataURL(value.avatar)
            }
          })
          createData.avatar = base64Avatar
        } else if (value.avatar === null) {
          createData.avatar = null
        }

        await createUserMutation.mutateAsync({
          data: createData
        })

        toastManager.add({
          type: 'success',
          title: 'Usuário criado',
          description: 'O usuário foi criado com sucesso.'
        })

        // Invalidar cache de usuários
        await queryClient.invalidateQueries({
          queryKey: getUsersQueryKey()
        })

        navigate({ to: '/app/usuarios' })
      } catch (error) {
        toastManager.add({
          type: 'error',
          title: 'Erro ao criar usuário',
          description: 'Verifique os dados e tente novamente.'
        })
      }
    },
  })

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Criar Usuário"
        description="Adicione um novo usuário ao sistema"
      />

      <form
        onSubmit={(e) => {
          e.stopPropagation()
          e.preventDefault()
          form.handleSubmit(e)
        }}
        className="space-y-6"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>
                Nome *
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
                placeholder="Nome completo do usuário"
              />
            </div>
          )}
        />

        <form.Field
          name="email"
          children={(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>
                Email *
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
                placeholder="email@exemplo.com"
              />
            </div>
          )}
        />

        <form.Field
          name="password"
          children={(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>
                Senha *
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
          )}
        />

        <form.Field
          name="role"
          children={(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>
                Função
              </Label>
              <Select
                items={availableRoles}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as 'user' | 'admin' | 'owner')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="avatar"
          children={(field) => (
            <ImageUploadField
              field={field}
              label="Avatar do Usuário"
              description="Selecione uma imagem para o avatar (opcional)"
            />
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || createUserMutation.isPending}
                className="flex-1"
                size="lg"
              >
                {isSubmitting || createUserMutation.isPending ? 'Criando usuário...' : 'Criar Usuário'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/app/usuarios' })}
                className="flex-1"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          )}
        />
      </form>
    </div>
  )
}

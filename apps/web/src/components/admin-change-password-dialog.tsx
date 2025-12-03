import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { usePutUsersByIdAdminPassword } from '@/http/gen'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldControl, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toastManager } from '@/components/ui/toast'
import { KeyRound } from 'lucide-react'

type AdminChangePasswordDialogProps = {
  userId: string
  userName: string
  trigger?: React.ReactNode
}

type AdminChangePasswordForm = {
  newPassword: string
  confirmPassword: string
}

export function AdminChangePasswordDialog({ userId, userName, trigger }: AdminChangePasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const changePasswordMutation = usePutUsersByIdAdminPassword()

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    } as AdminChangePasswordForm,
    onSubmit: async ({ value }) => {
      try {
        // Validações básicas
        if (!value.newPassword.trim()) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Nova senha é obrigatória.'
          })
          return
        }

        if (value.newPassword.length < 6) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Nova senha deve ter pelo menos 6 caracteres.'
          })
          return
        }

        if (value.newPassword !== value.confirmPassword) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Nova senha e confirmação não coincidem.'
          })
          return
        }

        // Admin alterando senha do usuário
        await changePasswordMutation.mutateAsync({
          id: userId,
          data: {
            newPassword: value.newPassword,
            confirmPassword: value.confirmPassword,
          }
        })

        toastManager.add({
          type: 'success',
          title: 'Senha alterada',
          description: `A senha do usuário "${userName}" foi alterada com sucesso.`
        })

        // Limpar formulário e fechar dialog
        form.reset()
        setIsOpen(false)

      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Erro ao alterar senha. Tente novamente.'
        toastManager.add({
          type: 'error',
          title: 'Erro ao alterar senha',
          description: message
        })
      }
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger render={<Button variant="outline" size="sm">
          <KeyRound className="h-4 w-4 mr-2" />
          Alterar Senha
        </Button>} />
      )}
      <DialogPopup className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Altere a senha do usuário "{userName}". A senha deve ter pelo menos 6 caracteres.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* New Password Field */}
            <form.Field
              name="newPassword"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length < 6
                    ? 'Nova senha deve ter pelo menos 6 caracteres'
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Nova Senha</FieldLabel>
                  <FieldControl
                    render={
                      <Input
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Digite a nova senha"
                        className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                      />
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </Field>
              )}
            </form.Field>

            {/* Confirm Password Field */}
            <form.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length < 6
                    ? 'Confirmação de senha é obrigatória'
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Confirmar Nova Senha</FieldLabel>
                  <FieldControl
                    render={
                      <Input
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Confirme a nova senha"
                        className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                      />
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </Field>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
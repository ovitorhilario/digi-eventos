import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGetUsers, useDeleteUsersById, getUsersQueryKey } from '@/http/gen'
import type { GetUsers200 } from '@/http/gen'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/page-header'
import { toastManager } from '@/components/ui/toast'
import { useAuth } from '@/context/auth'
import { AdminChangePasswordDialog } from '@/components/admin-change-password-dialog'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Frame, FramePanel } from '@/components/ui/frame'

export const Route = createFileRoute('/app/usuarios/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const { data: users, isLoading } = useGetUsers()
  const deleteUser = useDeleteUsersById({
    mutation: {
      onSuccess: () => {
        toastManager.add({
          type: 'success',
          title: 'Usuário deletado',
          description: 'O usuário foi deletado com sucesso.'
        })

        queryClient.refetchQueries({ queryKey: getUsersQueryKey() })
      },
      onError: (error) => {
        const message = (error.response?.data as any)?.message || 'Ocorreu um erro ao tentar deletar o usuário.'
        toastManager.add({
          type: 'error',
          title: 'Erro ao deletar usuário',
          description: message
        })
      },
      onSettled: () => {
        setUserToDelete(null)
        setIsDialogOpen(false)
        queryClient.refetchQueries({ queryKey: ['users'] })
      }
    }
  })
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title='Usuários'
        description='Gerencie os usuários do sistema'
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate({ to: '/app/usuarios/criar' })}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      <Frame className="w-full">
        <FramePanel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: GetUsers200[0]) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage 
                          src={user.avatarUrl ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Route.Link to={`/app/perfil/${user.id}`} className='hover:underline underline-offset-2'>
                        {user.name} {user.id === currentUser?.id ? '(Você)' : ''}
                      </Route.Link>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === 'owner'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                      {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {/* Owners podem alterar senha de qualquer usuário (exceto outros owners) */}
                      {/* Admins só podem alterar senha de users */}
                      {((currentUser?.role === 'owner' && user.role !== 'owner') ||
                        (currentUser?.role === 'admin' && user.role === 'user')) &&
                       user.id !== currentUser?.id ? (
                        <AdminChangePasswordDialog
                          userId={user.id}
                          userName={user.name || 'Usuário'}
                        />
                      ) : null}
                      {/* Owners podem deletar qualquer usuário (exceto outros owners) */}
                      {/* Admins só podem deletar users */}
                      {((currentUser?.role === 'owner' && user.role !== 'owner') ||
                        (currentUser?.role === 'admin' && user.role === 'user')) &&
                       user.id !== currentUser?.id ? (
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user.id)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar o usuário "{user.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogClose>
                                <Button variant="outline">Cancelar</Button>
                              </AlertDialogClose>
                              <Button
                                onClick={() => deleteUser.mutate({ id: user.id })}
                                variant="destructive"
                              >
                                Deletar
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Número de usuários</TableCell>
                <TableCell className="text-right font-medium">{users?.length ?? 0}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </FramePanel>
      </Frame>
    </div>
  )
}

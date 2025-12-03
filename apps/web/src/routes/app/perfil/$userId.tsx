import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGetUsersById, useGetEvents, useGetRegistrations } from '@/http/gen'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'
import { Edit, Calendar, Users, AlertTriangle, UserX } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const Route = createFileRoute('/app/perfil/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { data: user, isLoading, error } = useGetUsersById(userId)
  const { data: allEvents } = useGetEvents()
  const { data: allRegistrations } = useGetRegistrations()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  // Verificar se é o próprio perfil do usuário logado
  const isOwnProfile = currentUser?.id === userId

  // Filtrar eventos criados pelo usuário
  const createdEvents = allEvents?.filter(event => event.createdBy === userId) || []

  // Filtrar inscrições do usuário
  const userRegistrations = allRegistrations?.filter(reg => reg.userId === userId) || []

  // Obter eventos dos quais o usuário participa
  const participatedEventIds = userRegistrations.map(reg => reg.eventId)
  const participatedEvents = allEvents?.filter(event => participatedEventIds.includes(event.id)) || []

  // Combinar eventos criados e participados, removendo duplicatas
  const allUserEvents = [...createdEvents, ...participatedEvents].filter((event, index, self) => 
    self.findIndex(e => e.id === event.id) === index
  )

  // Ordenar por data de início, mais recentes primeiro
  const recentEvents = allUserEvents
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5) // Limitar a 5 eventos recentes

  // Contadores
  const eventsCreatedCount = createdEvents.length
  const participationsCount = participatedEvents.length

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-8">Carregando perfil...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>Erro ao carregar perfil</EmptyTitle>
            <EmptyDescription>
              Ocorreu um erro ao tentar carregar as informações do perfil. Tente novamente mais tarde.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserX />
            </EmptyMedia>
            <EmptyTitle>Usuário não encontrado</EmptyTitle>
            <EmptyDescription>
              O usuário que você está procurando não existe ou foi removido.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader 
        title={`Perfil de ${user.name}`} 
        description="Veja as informações do perfil" 
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {user.avatarUrl && (
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                )}
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full">
                    {user.email}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-800 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Button
                onClick={() => navigate({ to: '/app/perfil/editar/self' })}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informações de Contato</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{user.id}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Atividades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{eventsCreatedCount}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Eventos Criados</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{participationsCount}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Participações em Eventos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Eventos Recentes</h3>
            {recentEvents.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum evento encontrado</EmptyTitle>
                  <EmptyDescription>
                    Os eventos criados e participações aparecerão aqui quando houver atividade.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate({ to: `/evento/${event.id}` })}
                  >
                    <CardContent>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.startTime).toLocaleDateString('pt-BR')}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        {event.createdBy === userId && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Criado
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

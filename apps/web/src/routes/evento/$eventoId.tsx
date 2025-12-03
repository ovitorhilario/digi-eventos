import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useGetEventsById } from '@/http/gen'
import { useAuth } from '@/context/auth'
import { useUserRegistrations } from '@/lib/use-user-registrations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, UserPlus, UserMinus, AlertTriangle, CalendarX } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const Route = createFileRoute('/evento/$eventoId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventoId } = Route.useParams()
  const { user, isAuthenticated } = useAuth()
  const { data: event, isLoading, error } = useGetEventsById(eventoId)
  const { registerForEvent, cancelRegistration, isUserRegistered, registerMutation, cancelMutation } = useUserRegistrations()

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-8">Carregando...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>Erro ao carregar evento</EmptyTitle>
            <EmptyDescription>
              Ocorreu um erro ao tentar carregar as informações do evento. Tente novamente mais tarde.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX />
            </EmptyMedia>
            <EmptyTitle>Evento não encontrado</EmptyTitle>
            <EmptyDescription>
              O evento que você está procurando não existe ou foi removido.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // Verificar se o usuário está inscrito neste evento
  const userRegistration = event.participants.find(p => p.userId === user?.id)
  
  // Verificar se o usuário é o criador do evento
  const isEventCreator = user?.id === event.createdBy

  const handleRegister = async () => {
    try {
      await registerForEvent(eventoId)
    } catch (error) {
      console.error('Erro ao registrar no evento:', error)
    }
  }

  const handleUnregister = async () => {
    if (!userRegistration) return
    
    try {
      await cancelRegistration(eventoId)
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-8">Carregando...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader 
        title={event.title} 
        description="Detalhes do evento" 
      />

      <Card>
        <CardContent className="space-y-4">
          {event.imageUrl && (
            <div className="flex justify-center">
              <img
                src={event.imageUrl}
                alt={`Imagem do evento ${event.title}`}
                className="max-w-full w-full max-h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex gap-2">
              {isEventCreator && (
                <Link to="/app/evento/editar/$eventoId" params={{ eventoId }}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Evento
                  </Button>
                </Link>
              )}
              {isUserRegistered(eventoId) ? (
                <Button
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={cancelMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Inscrição'}
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? 'Inscrevendo...' : 'Inscrever-se'}
                </Button>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Localização</h3>
              <p className="text-gray-600 dark:text-gray-400">{event.location || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Data e Hora</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(event.startTime).toLocaleString('pt-BR')}
                {event.finishTime && ` - ${new Date(event.finishTime).toLocaleString('pt-BR')}`}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Capacidade Máxima</h3>
              <p className="text-gray-600 dark:text-gray-400">{event.maxCapacity || 'Ilimitada'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Participantes</h3>
              <p className="text-gray-600 dark:text-gray-400">{event.participantCount}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Lista de Participantes</h3>
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Você precisa estar logado para visualizar os participantes deste evento.
                </p>
                <Link 
                  to="/auth/sign-in" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Fazer login
                </Link>
              </div>
            ) : event.participants.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Nenhum participante ainda.</p>
            ) : (
              <div className="space-y-2">
                {event.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 px-5 py-3 rounded-xl border">
                    <Avatar>
                      {participant.user.avatarUrl && (
                        <AvatarImage
                          src={participant.user.avatarUrl}
                          alt={`Avatar de ${participant.user.name}`}
                        />
                      )}
                      <AvatarFallback>
                        {participant.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link to="/app/perfil/$userId" params={{ userId: participant.user.id }} className="font-medium hover:underline">
                        {participant.user.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{participant.user.email}</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">
                      Registrado em {new Date(participant.registeredAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

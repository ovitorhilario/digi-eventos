import { createFileRoute } from '@tanstack/react-router'
import { useGetEvents, useGetRegistrations } from '@/http/gen'
import { useAuth } from '@/context/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Calendar, Users, Plus, Filter } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useState } from 'react'

export const Route = createFileRoute('/app/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { user } = useAuth()
  const { data: allEvents, isLoading: eventsLoading, error: eventsError } = useGetEvents()
  const { data: registrations, isLoading: registrationsLoading, error: registrationsError } = useGetRegistrations()
  const [showOnlyRegistered, setShowOnlyRegistered] = useState(false)

  const isLoading = eventsLoading || registrationsLoading
  const error = eventsError || registrationsError

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-8">Carregando dashboard...</div>
  }

  if (error) {
    return <div className="container mx-auto max-w-4xl px-4 py-8">Erro ao carregar dashboard: {error.message}</div>
  }

  // Filtrar eventos criados pelo usuário (se for admin)
  const createdEvents = allEvents?.filter(event => event.createdBy === user?.id) || []

  // Filtrar inscrições do usuário atual
  const userRegistrations = registrations?.filter(reg => reg.userId === user?.id) || []

  // Obter eventos em que o usuário está inscrito
  const participatedEvents = allEvents?.filter(event =>
    userRegistrations.some(reg => reg.eventId === event.id)
  ) || []

  // Filtrar eventos baseado no toggle
  const eventsToShow = showOnlyRegistered ? participatedEvents : (allEvents || [])

  // Obter eventos futuros ordenados cronologicamente
  const upcomingEvents = eventsToShow.filter(event => new Date(event.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Obter eventos passados ordenados cronologicamente (mais recentes primeiro)
  const pastEvents = eventsToShow.filter(event => new Date(event.startTime) <= new Date())
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader 
        title="Dashboard" 
        description="Gerencie seus eventos e inscrições" 
        backTo={null} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">{participatedEvents.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Eventos Inscritos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(user?.role === 'admin' || user?.role === 'owner') && (
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">{createdEvents.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Eventos Criados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">{(allEvents?.length || 0)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total de Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Tabs defaultValue="agenda">
          <TabsList>
            <TabsTab value="agenda">Agenda de Eventos</TabsTab>
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <TabsTab value="criados">Eventos Criados</TabsTab>
            )}
          </TabsList>

          <TabsPanel value="agenda">
            <div className="mt-6">
              {/* Filtro de Eventos */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-xl font-semibold tracking-tight">Agenda de Eventos</h2>
                <Button
                  variant={showOnlyRegistered ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowOnlyRegistered(!showOnlyRegistered)}
                  className="flex items-center gap-2 text-xs"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {showOnlyRegistered ? 'Todos os Eventos' : 'Apenas Inscritos'}
                </Button>
              </div>

              {/* Badge informativa */}
              {showOnlyRegistered && (
                <div className="mb-8 p-3.5 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-md">
                  <p className="text-xs text-blue-900 dark:text-blue-100 flex items-center gap-2 font-medium">
                    <Users className="h-3.5 w-3.5" />
                    Mostrando {participatedEvents.length} {participatedEvents.length === 1 ? 'evento inscrito' : 'eventos inscritos'}
                  </p>
                </div>
              )}
              
              {/* Eventos Futuros */}
              <div className="mb-12">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Calendar className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    Próximos Eventos
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    ({upcomingEvents.length})
                  </span>
                </div>
                {upcomingEvents.length === 0 ? (
                  <Card className="border border-dashed border-gray-200 dark:border-gray-700 shadow-none">
                    <CardContent className="pt-6">
                      <div className="text-center py-16">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 dark:bg-gray-800/50 mb-4">
                          <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                          {showOnlyRegistered 
                            ? 'Você não está inscrito em nenhum evento futuro'
                            : 'Nenhum evento futuro agendado'
                          }
                        </p>
                        {!showOnlyRegistered && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Novos eventos aparecerão aqui quando forem criados
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const isRegistered = userRegistrations.some(reg => reg.eventId === event.id)
                      const daysUntil = Math.ceil((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <Card 
                          key={event.id} 
                          className="group relative overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/50 rounded-xl"
                        >
                          {/* Badge de destaque para eventos próximos */}
                          {daysUntil <= 7 && (
                            <div className="absolute top-4 right-4 z-10">
                              <span className="px-3 py-1 text-[10px] font-bold bg-blue-500 text-white rounded-full shadow-sm uppercase tracking-wider">
                                {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil}d`}
                              </span>
                            </div>
                          )}
                          
                          <CardHeader className="p-0">
                            <div className="flex gap-5">
                              {/* Date Block */}
                              <div className="flex flex-col items-center justify-center w-24 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 rounded-l-xl p-2">
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tighter">
                                  {new Date(event.startTime).toLocaleDateString('pt-BR', { day: 'numeric' })}
                                </span>
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  {new Date(event.startTime).toLocaleDateString('pt-BR', { month: 'short' })}
                                </span>
                              </div>

                              {/* Details Block */}
                              <div className="flex-1 py-4 pr-4 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <CardTitle className="text-base font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                    <Link
                                      to="/evento/$eventoId"
                                      params={{ eventoId: event.id }}
                                      className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    >
                                      {event.title}
                                      <span className="absolute inset-0"></span>
                                    </Link>
                                  </CardTitle>
                                  {isRegistered && (
                                    <span className="relative z-20 px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full flex items-center gap-1 uppercase tracking-wide shrink-0">
                                      <Users className="h-2.5 w-2.5" />
                                      Inscrito
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <div className="leading-tight">
                                      <span className="font-medium">{new Date(event.startTime).toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                                      <span className="text-gray-400 dark:text-gray-500 ml-1.5">
                                        às {new Date(event.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {event.participantCount}
                                      {event.maxCapacity && ` de ${event.maxCapacity} vagas`}
                                    </span>
                                    {event.maxCapacity && (
                                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium ml-auto">
                                        {Math.round((event.participantCount / event.maxCapacity) * 100)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Eventos Passados */}
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Calendar className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    Eventos Passados
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    ({pastEvents.length})
                  </span>
                </div>
                {pastEvents.length === 0 ? (
                  <Card className="border border-dashed border-gray-200 dark:border-gray-700 shadow-none">
                    <CardContent className="pt-6">
                      <div className="text-center py-16">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 dark:bg-gray-800/50 mb-4">
                          <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {showOnlyRegistered 
                            ? 'Você não participou de nenhum evento ainda'
                            : 'Nenhum evento passado encontrado'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pastEvents.slice(0, 10).map((event) => {
                      const isRegistered = userRegistrations.some(reg => reg.eventId === event.id)
                      
                      return (
                        <Card 
                          key={event.id} 
                          className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl"
                        >
                          <CardHeader className="p-0">
                            <div className="flex items-center gap-4">
                              {/* Date Block */}
                              <div className="flex flex-col items-center justify-center w-24 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 rounded-l-xl p-2">
                                <span className="text-3xl font-bold text-gray-500 dark:text-gray-400 tracking-tighter">
                                  {new Date(event.startTime).toLocaleDateString('pt-BR', { day: 'numeric' })}
                                </span>
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  {new Date(event.startTime).toLocaleDateString('pt-BR', { month: 'short' })}
                                </span>
                              </div>

                              {/* Details Block */}
                              <div className="flex-1 py-3 pr-4 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors leading-tight">
                                    <Link
                                      to="/evento/$eventoId"
                                      params={{ eventoId: event.id }}
                                      className="focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                                    >
                                      {event.title}
                                      <span className="absolute inset-0"></span>
                                    </Link>
                                  </CardTitle>
                                  {isRegistered && (
                                    <span className="relative z-20 px-2 py-0.5 text-[9px] font-semibold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full uppercase tracking-wide shrink-0">
                                      Participou
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3" />
                                    <span>{event.participantCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                    {pastEvents.length > 10 && (
                      <div className="text-center py-4 mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          +{pastEvents.length - 10} eventos anteriores
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsPanel>

          {(user?.role === 'admin' || user?.role === 'owner') && (
            <TabsPanel value="criados">
              <div className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold tracking-tight">Eventos Criados</h2>
                  <Link to="/app/evento/criar">
                    <Button size="sm" className="text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Criar Evento
                    </Button>
                  </Link>
                </div>
                {createdEvents.length === 0 ? (
                  <Card className="border border-dashed border-gray-200 dark:border-gray-700 shadow-none">
                    <CardContent className="pt-6">
                      <div className="text-center py-16">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 dark:bg-gray-800/50 mb-4">
                          <Plus className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                          Você ainda não criou nenhum evento
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                          Como administrador, você pode criar e gerenciar eventos
                        </p>
                        <Link to="/app/evento/criar">
                          <Button size="sm" className="text-xs">
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Criar Primeiro Evento
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {createdEvents.map((event) => (
                      <Card 
                        key={event.id} 
                        className="group relative overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/50 rounded-xl"
                      >
                        <CardHeader className="p-0">
                          <div className="flex gap-5">
                            {/* Date Block */}
                            <div className="flex flex-col items-center justify-center w-24 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 rounded-l-xl p-2">
                              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tighter">
                                {new Date(event.startTime).toLocaleDateString('pt-BR', { day: 'numeric' })}
                              </span>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {new Date(event.startTime).toLocaleDateString('pt-BR', { month: 'short' })}
                              </span>
                            </div>

                            {/* Details Block */}
                            <div className="flex-1 py-4 pr-4 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <CardTitle className="text-base font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                  <Link
                                    to="/evento/$eventoId"
                                    params={{ eventoId: event.id }}
                                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                  >
                                    {event.title}
                                    <span className="absolute inset-0"></span>
                                  </Link>
                                </CardTitle>
                                <span className="relative z-20 px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full uppercase tracking-wide shrink-0">
                                  Seu evento
                                </span>
                              </div>
                              
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <div className="leading-tight">
                                    <span className="font-medium">{new Date(event.startTime).toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                                    <span className="text-gray-400 dark:text-gray-500 ml-1.5">
                                      às {new Date(event.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <Users className="h-3.5 w-3.5" />
                                  <span className="font-medium">
                                    {event.participantCount} participante{event.participantCount !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsPanel>
          )}
        </Tabs>
      </div>
    </div>
  )
}
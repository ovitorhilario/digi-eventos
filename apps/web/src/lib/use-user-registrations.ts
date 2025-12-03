import { useGetRegistrations, usePostRegistrations, useDeleteRegistrationsById, getRegistrationsQueryKey, getEventsByIdQueryKey } from '@/http/gen'
import { useAuth } from '@/context/auth'
import { useQueryClient } from '@tanstack/react-query'
import { toastManager } from '@/components/ui/toast'

export function useUserRegistrations() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: registrations } = useGetRegistrations({
    query: {
      enabled: isAuthenticated,
    },
  })

  const registerMutation = usePostRegistrations({
    mutation: {
      onSuccess: (_, vars) => {
        toastManager.add({
          type: 'success',
          title: 'Inscrição realizada!',
          description: 'Você foi inscrito no evento com sucesso.'
        })
      
        queryClient.invalidateQueries({ queryKey: getRegistrationsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getEventsByIdQueryKey(vars.data.eventId) })
      },
      onError: (err) => {
        const response = err.response?.data as any;
        const message = response?.message || 'Erro ao registrar no evento';

        toastManager.add({
          title: 'Erro',
          description: message,
          type: 'error',
        });
      }
    }
  })

  const cancelMutation = useDeleteRegistrationsById({
    mutation: {
      onSuccess: (_, vars) => {
        toastManager.add({
          type: 'info',
          title: 'Inscrição cancelada!',
          description: 'Sua inscrição no evento foi cancelada.'
        })

        queryClient.invalidateQueries({ queryKey: getRegistrationsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getEventsByIdQueryKey(vars.id) })

      },
      onError: (err) => {
        const response = err.response?.data as any;
        const message = response?.message || 'Erro ao cancelar a inscrição';  
        toastManager.add({
          title: 'Erro',
          description: message,
          type: 'error',
        });
      }
    }
  })

  const isUserRegistered = (eventId: string) => {
    if (!registrations || !Array.isArray(registrations) || !isAuthenticated) {
      return false;
    }
    return registrations?.some(reg => reg.eventId === eventId && !reg.cancelledParticipation) ?? false
  }

  const registerForEvent = async (eventId: string) => {
    registerMutation.mutate({ 
      data: { eventId }
    })
  }

  const cancelRegistration = async (eventId: string) => {
    // Encontra a inscrição ativa para este evento
    const userRegistration = registrations?.find(
      reg => reg.eventId === eventId && !reg.cancelledParticipation
    )

    if (!userRegistration) {
      toastManager.add({
        title: 'Erro',
        description: 'Inscrição não encontrada para este evento.',
        type: 'error',
      })
      return
    }

    cancelMutation.mutate({ id: userRegistration.id })
  }

  return {
    // Data
    registrations,

    // Actions
    registerForEvent,
    cancelRegistration,
    isUserRegistered,

    // Loading states from mutations
    isRegisteringEventId: registerMutation.isPending ? 'pending' : null,
    isCancelingEventId: cancelMutation.isPending ? 'pending' : null,
    
    // For more granular control if needed
    registerMutation,
    cancelMutation,
  }
}
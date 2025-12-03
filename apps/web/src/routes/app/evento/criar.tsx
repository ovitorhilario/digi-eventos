import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { getEventsQueryKey, usePostEvents } from '@/http/gen'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toastManager } from '@/components/ui/toast'
import { ImageUploadField } from '@/components/image-upload-field'
import { PageHeader } from '@/components/page-header'
import { useQueryClient } from '@tanstack/react-query'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from '@/components/ui/combobox'
import { useGetCategories } from '@/http/gen'

type CreateEventForm = {
  title: string
  description?: string
  location?: string
  startTime: string
  finishTime?: string
  maxCapacity?: number
  categoryIds: { value: string; label: string }[]
  image?: File | null
}

export const Route = createFileRoute('/app/evento/criar')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutateAsync: createEvent, isPending } = usePostEvents()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useGetCategories()

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      finishTime: '',
      maxCapacity: undefined as number | undefined,
      categoryIds: [],
    } as CreateEventForm,
    onSubmit: async ({ value }) => {
      try {
        // Validação básica
        if (!value.title.trim()) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Título é obrigatório.'
          })
          return
        }

        if (!value.startTime) {
          toastManager.add({
            type: 'error',
            title: 'Erro de validação',
            description: 'Data e hora de início são obrigatórias.'
          })
          return
        }

        // Preparar dados do evento
        const eventData: any = {
          title: value.title,
          description: value.description || null,
          location: value.location || null,
          startTime: value.startTime,
          finishTime: value.finishTime || null,
          maxCapacity: value.maxCapacity || null,
          categoryIds: value.categoryIds.map(item => item.value),
        }

        // Processar imagem se fornecida
        if (value.image instanceof File) {
          const imageFile = value.image as File
          const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageFile)
          })
          eventData.image = base64Image
        }

        await createEvent({ data: eventData })
        
        await queryClient.invalidateQueries({
          queryKey: getEventsQueryKey(),
        })
        
        toastManager.add({
          type: 'success',
          title: 'Evento criado com sucesso!'
        })
        
        navigate({ to: '/app/dashboard' })
      } catch (error) {
        toastManager.add({
          type: 'error',
          title: 'Erro ao criar evento',
          description: 'Tente novamente mais tarde.'
        })
      }
    },
  })

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader 
        title="Criar Novo Evento" 
        description="Preencha os detalhes do seu evento" 
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
          name="title"
          children={(field) => (
            <div className="space-y-1">
              <Label
                htmlFor={field.name}
              >
                Título *
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
                placeholder="Nome do evento"
              />
            </div>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-1">
              <Label
                htmlFor={field.name}
              >
                Descrição
              </Label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                className="bg-background dark:bg-input/32 mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-xs focus:outline-none text-sm"
                placeholder="Descrição detalhada do evento"
                rows={4}
              />
            </div>
          )}
        />

        <form.Field
          name="location"
          children={(field) => (
            <div className="space-y-1">
              <Label
                htmlFor={field.name}
              >
                Localização
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
                placeholder="Endereço ou local do evento"
              />
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field
            name="startTime"
            children={(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                >
                  Data e Hora de Início *
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          />

          <form.Field
            name="finishTime"
            children={(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                >
                  Data e Hora de Fim
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          />
        </div>

        <form.Field
          name="maxCapacity"
          children={(field) => (
            <div className="space-y-1">
              <Label
                htmlFor={field.name}
              >
                Capacidade Máxima
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min="1"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1"
                placeholder="Número máximo de participantes"
              />
            </div>
          )}
        />

        <form.Field
          name="categoryIds"
          children={(field) => (
            <div className="space-y-1">
              <Label 
                htmlFor={field.name}
              >
                Categorias
              </Label>
              <Combobox
                items={categories.map(cat => ({ label: cat.title, value: cat.id }))}
                multiple
                value={field.state.value || []}
                onValueChange={(value) => field.handleChange(value || [])}
              >
                <ComboboxChips>
                  <ComboboxValue>
                    {(value: { value: string; label: string }[]) => (
                      <>
                        {value?.map((item) => (
                          <ComboboxChip key={item.value} aria-label={item.label}>
                            {item.label}
                          </ComboboxChip>
                        ))}
                        <ComboboxInput
                          placeholder={value.length > 0 ? undefined : "Selecione as categorias..."}
                          aria-label="Selecione as categorias"
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxPopup>
                  <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxPopup>
              </Combobox>
            </div>
          )}
        />

        <form.Field
          name="image"
          children={(field) => (
            <ImageUploadField
              field={field}
              label="Imagem do Evento"
              description="Selecione uma imagem para o evento (opcional)"
            />
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isPending}
              className="w-full"
              size="lg"
            >
              {isSubmitting || isPending ? 'Criando evento...' : 'Criar Evento'}
            </Button>
          )}
        />
      </form>
    </div>
  )
}

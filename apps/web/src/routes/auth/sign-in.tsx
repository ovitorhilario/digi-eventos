import { createFileRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { useAuth } from '@/context/auth'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { toastManager } from '@/components/ui/toast'
import digiEventosLogo from '@/assets/digieventos-logo-ic.png'
import { useState } from 'react'

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// Schema de busca para capturar redirect URL
const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: searchSchema,
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  }
})

function RouteComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/sign-in' })
  const { login, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | string[]>>({})

  const handleClearErrors = (next: Record<string, string | string[]>) => setErrors(next)

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = signInSchema.safeParse(Object.fromEntries(formData as any))

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error)
      return { errors: fieldErrors as Record<string, string | string[]> }
    }

    // Perform login
    try {
      await login(result.data.email, result.data.password)
      toastManager.add({
        type: 'success',
        title: 'Login realizado com sucesso!'
      })

      // Se houver uma URL de redirecionamento, navega para lá
      // Caso contrário, vai para a home
      if (search.redirect) {
        // In some cases we want a full redirect (external or other origin)
        window.location.href = search.redirect
      } else {
        navigate({ to: '/' })
      }

      return { errors: {} as Record<string, string | string[]> }
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Erro ao fazer login',
        description: 'Email ou senha incorretos.'
      })
      return { errors: {} as Record<string, string | string[]> }
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const formEl = event.currentTarget
    setLoading(true)
    const response = await submitForm(event)
    setErrors(response.errors)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-12">
            <img 
              src={digiEventosLogo} 
              alt="DigiEventos Logo" 
              className="h-24 w-auto"
            />
          </div>
        </div>

        <Form
          className="mt-8 space-y-6"
          errors={errors}
          onClearErrors={handleClearErrors}
          onSubmit={onSubmit}
        >
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <FieldControl
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              disabled={loading}
            />
            <FieldError />
          </Field>

          <Field name="password">
            <FieldLabel>Senha</FieldLabel>
            <FieldControl
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={loading}
            />
            <FieldError />
          </Field>

          <Button
            type="submit"
            disabled={loading || isLoading}
            className="w-full"
            size="lg"
          >
            {loading || isLoading ? 'Fazendo login...' : 'Fazer login'}
          </Button>
        </Form>
      </div>
    </div>
  )
}

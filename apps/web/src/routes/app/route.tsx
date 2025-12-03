import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/app')({
  component: ProtectedLayoutComponent,
})

function ProtectedLayoutComponent() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setShowDialog(true)
    }
  }, [isAuthenticated])

  const handleConfirm = () => {
    setShowDialog(false)
    navigate({
      to: '/auth/sign-in',
      search: {
        redirect: window.location.href,
      },
    })
  }

  if (!isAuthenticated) {
    return (
      <>
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Área Restrita</AlertDialogTitle>
              <AlertDialogDescription>
                Esta página é privada e requer autenticação. Você será redirecionado para a página de login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={handleConfirm}>
                Ir para Login
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return <Outlet />
}
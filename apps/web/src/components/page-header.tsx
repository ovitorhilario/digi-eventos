import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  backTo?: string | null
  backText?: string
}

export function PageHeader({ 
  title, 
  description, 
  backTo, 
  backText = 'Voltar',
}: PageHeaderProps) {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  const handleOnBack = () => {
    if (backTo === null) {
      // omit
      return;
    }

    if (backTo) {
      router.navigate({ to: backTo });
      return;
    }

    if (canGoBack) {
      router.history.back();
    } else {
      router.navigate({ to: '/app/dashboard' });
    }
  }

  return (
    <div className="mb-6">
      {backTo !== null && (
        <button 
          onClick={handleOnBack}
          className="cursor-pointer inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3 text-sm md:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backText}
        </button>
      )}
      <h1 className="text-xl md:text-2xl xl:text-3xl font-bold">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1.5 md:mt-2 text-sm md:text-base">
        {description}
      </p>
    </div>
  )
}
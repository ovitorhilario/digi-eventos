import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"

import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ImageUploadFieldProps {
  /**
   * Field API from TanStack Form - inferred from form.Field render prop
   * Example: <form.Field name="image">{(field) => <ImageUploadField field={field} />}</form.Field>
   */
  field: {
    name: string
    state: {
      value: File | null | undefined
      meta: {
        isTouched: boolean
        isValid: boolean
        errors: (string | undefined)[]
        isValidating: boolean
      }
    }
    handleChange: (value: File | null | undefined) => void
    handleBlur: () => void
  }
  currentImage?: string | null // URL da imagem atual
  label?: string
  description?: string
  maxSizeMB?: number
}

/**
 * ImageUploadField - Componente de upload de imagem para TanStack Form
 * 
 * @example
 * ```tsx
 * <form.Field name="image">
 *   {(field) => (
 *     <ImageUploadField
 *       field={field}
 *       currentImage={event?.image}
 *       label="Imagem do Evento"
 *       description="Selecione uma imagem (opcional)"
 *       maxSizeMB={4}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function ImageUploadField({
  field,
  currentImage,
  label = "Imagem",
  description = "Selecione uma imagem (opcional)",
  maxSizeMB = 4,
}: ImageUploadFieldProps) {
  const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp",
    maxSize,
    multiple: false,
    onFilesChange: (newFiles) => {
      // Update the form field value with the File object
      const file = newFiles[0]?.file
      if (file instanceof File) {
        field.handleChange(file)
      } else {
        field.handleChange(undefined)
      }
    },
  })

  const previewUrl = files[0]?.preview
  const hasNewImage = files.length > 0
  const hasCurrentImage = !!currentImage

  const handleRemoveImage = () => {
    if (hasNewImage) {
      removeFile(files[0].id)
    } else if (hasCurrentImage) {
      // Clear current image by setting field to null
      field.handleChange(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label}
      </Label>

      {hasCurrentImage && !hasNewImage && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Imagem atual:</p>
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt="Imagem atual"
              className="max-w-xs max-h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              onClick={handleRemoveImage}
              aria-label="Remover imagem atual"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps({
              onBlur: field.handleBlur,
            })}
            className="sr-only"
            aria-label={`Upload ${label.toLowerCase()}`}
          />

          {previewUrl && hasNewImage ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt={files[0]?.file?.name || "Imagem selecionada"}
                className="mx-auto max-h-full rounded object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1 text-sm font-medium">
                {hasCurrentImage ? "Alterar imagem" : "Selecionar imagem"}
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, JPG, GIF ou WebP (máx. {maxSizeMB}MB)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={openFileDialog}
              >
                <UploadIcon
                  className="-ms-1 size-4 opacity-60"
                  aria-hidden="true"
                />
                {hasCurrentImage ? "Alterar" : "Selecionar"}
              </Button>
            </div>
          )}
        </div>

        {previewUrl && hasNewImage && (
          <div className="absolute top-2 right-2">
            <button
              type="button"
              className="z-50 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
              onClick={handleRemoveImage}
              aria-label="Remover imagem"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
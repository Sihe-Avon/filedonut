import React, { JSX, useState, useCallback, useEffect, useRef } from 'react'
import { extractFileList } from '../fs'

export default function DropZone({
  onDrop,
}: {
  onDrop: (files: File[]) => void
}): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  const showSizeError = useCallback(() => {
    setError('File size limit is 5MB. Please select a smaller file.')
    setTimeout(() => setError(null), 3000)
  }, [])

  const filterFiles = useCallback((files: File[]) => {
    if (files.some(f => f.size > MAX_SIZE)) {
      showSizeError()
      return []
    }
    return files
  }, [showSizeError])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setFileCount(e.dataTransfer?.items.length || 0)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    const currentTarget =
      e.currentTarget === window ? window.document : e.currentTarget
    if (
      e.relatedTarget &&
      currentTarget instanceof Node &&
      currentTarget.contains(e.relatedTarget as Node)
    ) {
      return
    }
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer) {
        const files = await extractFileList(e)
        const validFiles = filterFiles(files)
        if (validFiles.length > 0) onDrop(validFiles)
      }
    },
    [onDrop, filterFiles],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        const validFiles = filterFiles(files)
        if (validFiles.length > 0) onDrop(validFiles)
      }
    },
    [onDrop, filterFiles],
  )

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        <button
          className="block cursor-pointer relative py-3 px-6 text-base font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border-2 border-stone-700 dark:border-stone-700 rounded-lg transition-all duration-300 ease-in-out outline-none hover:shadow-md active:shadow-inner focus:shadow-outline hover:scale-105"
          onClick={handleClick}
        >
          <span className="text-center text-stone-700 dark:text-stone-200">
            Drop a file or click to get started
          </span>
        </button>
        {error && (
          <div className="w-full text-center text-xs text-red-500 mt-2">{error}</div>
        )}
      </div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-2xl text-white transition-opacity duration-300 backdrop-blur-sm z-50 ${
          isDragging ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        Drop to select {fileCount} file{fileCount !== 1 ? 's' : ''}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
    </>
  )
}

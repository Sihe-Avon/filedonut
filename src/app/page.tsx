'use client'

import React, { JSX, useCallback, useState } from 'react'
import WebRTCPeerProvider from '../components/WebRTCProvider'
import DropZone from '../components/DropZone'
import UploadFileList from '../components/UploadFileList'
import Uploader from '../components/Uploader'
import PasswordField from '../components/PasswordField'
import StartButton from '../components/StartButton'
import { UploadedFile } from '../types'
import Spinner from '../components/Spinner'
import Wordmark from '../components/Wordmark'
import CancelButton from '../components/CancelButton'
import { useMemo } from 'react'
import { getFileName } from '../fs'
import TitleText from '../components/TitleText'
import { pluralize } from '../utils/pluralize'
import TermsAcceptance from '../components/TermsAcceptance'

function PageWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col items-center py-2 max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto px-4">
      <div className="flex flex-col items-center">
        <Spinner direction="up" />
        <Wordmark />
      </div>
      {children}
    </div>
  )
}

function InitialState({
  onDrop,
}: {
  onDrop: (files: UploadedFile[]) => void
}): JSX.Element {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <TitleText>Peer-to-peer file transfers in your browser.</TitleText>
        <div className="mt-3 w-full flex justify-center">
          <DropZone onDrop={onDrop} />
        </div>
        <div className="mt-4 mb-1 w-full text-center text-xs text-stone-700 dark:text-stone-200">
          Each file must be under <span className="underline">5MB</span>.
        </div>
        <div className="mt-2 w-full">
          <TermsAcceptance />
        </div>
      </div>
    </PageWrapper>
  )
}

function useUploaderFileListData(uploadedFiles: UploadedFile[]) {
  return useMemo(() => {
    return uploadedFiles.map((item) => ({
      fileName: getFileName(item),
      type: item.type,
    }))
  }, [uploadedFiles])
}

function ConfirmUploadState({
  uploadedFiles,
  password,
  onChangePassword,
  onCancel,
  onStart,
  onRemoveFile,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  onChangePassword: (pw: string) => void
  onCancel: () => void
  onStart: () => void
  onRemoveFile: (index: number) => void
}): JSX.Element {
  const fileListData = useUploaderFileListData(uploadedFiles)
  return (
    <PageWrapper>
      <div className="mb-6">
        <TitleText>
          You are about to start uploading{' '}
          {pluralize(uploadedFiles.length, 'file', 'files')}.
        </TitleText>
      </div>
      <div className="mb-6 w-full">
        <UploadFileList files={fileListData} onRemove={onRemoveFile} />
      </div>
      <div className="mb-4 w-full">
        <PasswordField value={password} onChange={onChangePassword} />
      </div>
      <div className="flex space-x-4 mb-4">
        <CancelButton onClick={onCancel} />
        <StartButton onClick={onStart} />
      </div>
    </PageWrapper>
  )
}

function UploadingState({
  uploadedFiles,
  password,
  onStop,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  onStop: () => void
}): JSX.Element {
  const fileListData = useUploaderFileListData(uploadedFiles)
  return (
    <PageWrapper>
      <div className="mb-6">
        <TitleText>
          You are uploading {pluralize(uploadedFiles.length, 'file', 'files')}.
        </TitleText>
      </div>
      <div className="w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <UploadFileList files={fileListData} />
      </div>
      <WebRTCPeerProvider>
        <Uploader files={uploadedFiles} password={password} onStop={onStop} />
      </WebRTCPeerProvider>
    </PageWrapper>
  )
}

export default function UploadPage(): JSX.Element {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleDrop = useCallback((files: UploadedFile[]): void => {
    setUploadedFiles(files)
  }, [])

  const handleChangePassword = useCallback((pw: string) => {
    setPassword(pw)
  }, [])

  const handleStart = useCallback(() => {
    setUploading(true)
  }, [])

  const handleStop = useCallback(() => {
    setUploading(false)
  }, [])

  const handleCancel = useCallback(() => {
    setUploadedFiles([])
    setUploading(false)
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((fs) => fs.filter((_, i) => i !== index))
  }, [])

  if (!uploadedFiles.length) {
    return <InitialState onDrop={handleDrop} />
  }

  if (!uploading) {
    return (
      <ConfirmUploadState
        uploadedFiles={uploadedFiles}
        password={password}
        onChangePassword={handleChangePassword}
        onCancel={handleCancel}
        onStart={handleStart}
        onRemoveFile={handleRemoveFile}
      />
    )
  }

  return (
    <UploadingState
      uploadedFiles={uploadedFiles}
      password={password}
      onStop={handleStop}
    />
  )
}

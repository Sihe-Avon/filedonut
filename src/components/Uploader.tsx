'use client'

import React, { JSX, useCallback, useEffect } from 'react'
import { UploadedFile, UploaderConnectionStatus } from '../types'
import { useWebRTCPeer } from './WebRTCProvider'
import QRCode from 'react-qr-code'
import Loading from './Loading'
import StopButton from './StopButton'
import { useUploaderChannel } from '../hooks/useUploaderChannel'
import { useUploaderConnections } from '../hooks/useUploaderConnections'
import { CopyableInput } from './CopyableInput'
import { ConnectionListItem } from './ConnectionListItem'
import { ErrorMessage } from './ErrorMessage'
import { setRotating } from '../hooks/useRotatingSpinner'

const QR_CODE_SIZE = 112

export default function Uploader({
  files,
  password,
  onStop,
}: {
  files: UploadedFile[]
  password: string
  onStop: () => void
}): JSX.Element {
  const { peer, stop } = useWebRTCPeer()
  const { isLoading, error, longSlug, shortSlug, longURL, shortURL } =
    useUploaderChannel(peer.id)
  const connections = useUploaderConnections(peer, files, password)

  const handleStop = useCallback(() => {
    stop()
    onStop()
  }, [stop, onStop])

  const activeDownloaders = connections.filter(
    (conn) => conn.status === UploaderConnectionStatus.Uploading,
  ).length

  useEffect(() => {
    setRotating(activeDownloaders > 0)
  }, [activeDownloaders])

  if (isLoading || !longSlug || !shortSlug) {
    return <Loading text="Creating channel..." />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <>
      <div className="max-w-full sm:max-w-2xl lg:max-w-4xl w-full mx-auto p-4 rounded-lg shadow mt-8 mb-4 border border-white/30 dark:border-stone-100/20 bg-white/40 dark:bg-stone-900/40 backdrop-blur">
        <div className="flex items-start gap-8">
          <div className="flex-none bg-white p-2 rounded-lg flex items-center justify-center w-32 h-32">
            <QRCode
              value={shortURL ?? ''}
              size={QR_CODE_SIZE}
              bgColor="#fff"
              fgColor="#22223b"
              style={{ width: 112, height: 112, display: 'block' }}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-4 self-stretch justify-center w-full">
            <CopyableInput label="Long URL" value={longURL ?? ''} />
            <CopyableInput label="Short URL" value={shortURL ?? ''} />
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-stone-400 dark:text-stone-200">
            {activeDownloaders} Downloading, {connections.length} Total
          </h2>
          <StopButton onClick={handleStop} />
        </div>
        {connections.map((conn, i) => (
          <ConnectionListItem key={i} conn={conn} />
        ))}
      </div>
    </>
  )
}

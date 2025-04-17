import { useState, useCallback, useRef, useEffect } from 'react'
import { useWebRTCPeer } from '../components/WebRTCProvider'
import { z } from 'zod'
import { ChunkMessage, decodeMessage, Message, MessageType } from '../messages'
import { DataConnection } from 'peerjs'
import {
  streamDownloadSingleFile,
  streamDownloadMultipleFiles,
} from '../utils/download'
import {
  browserName,
  browserVersion,
  osName,
  osVersion,
  mobileVendor,
  mobileModel,
  isMobile
} from 'react-device-detect'
import { setRotating } from './useRotatingSpinner'
const cleanErrorMessage = (errorMessage: string): string =>
  errorMessage.startsWith('Could not connect to peer')
    ? 'Could not connect to the uploader. Did they close their browser?'
    : errorMessage

const getZipFilename = (): string => `filepizza-download-${Date.now()}.zip`

export function useDownloader(uploaderPeerID: string): {
  filesInfo: Array<{ fileName: string; size: number; type: string }> | null
  isConnected: boolean
  isPasswordRequired: boolean
  isDownloading: boolean
  isDone: boolean
  errorMessage: string | null
  submitPassword: (password: string) => void
  startDownload: () => void
  stopDownload: () => void
  totalSize: number
  bytesDownloaded: number
} {
  const { peer } = useWebRTCPeer()
  const [dataConnection, setDataConnection] = useState<DataConnection | null>(
    null,
  )
  const [filesInfo, setFilesInfo] = useState<Array<{
    fileName: string
    size: number
    type: string
  }> | null>(null)
  const processChunk = useRef<
    ((message: z.infer<typeof ChunkMessage>) => void) | null
  >(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDone, setDone] = useState(false)
  const [bytesDownloaded, setBytesDownloaded] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!peer) return
    console.log('[Downloader] connecting to uploader', uploaderPeerID)
    const conn = peer.connect(uploaderPeerID, { reliable: true })
    setDataConnection(conn)

    const handleOpen = () => {
      console.log('[Downloader] connection opened')
      setIsConnected(true)
      conn.send({
        type: MessageType.RequestInfo,
        browserName,
        browserVersion,
        osName,
        osVersion,
        mobileVendor,
        mobileModel,
      } as z.infer<typeof Message>)
    }

    const handleData = (data: unknown) => {
      try {
        const message = decodeMessage(data)
        console.log('[Downloader] received message', message.type)
        switch (message.type) {
          case MessageType.PasswordRequired:
            setIsPasswordRequired(true)
            if (message.errorMessage) setErrorMessage(message.errorMessage)
            break
          case MessageType.Info:
            setFilesInfo(message.files)
            setIsPasswordRequired(false)
            break
          case MessageType.Chunk:
            processChunk.current?.(message)
            setRotating(true)
            break
          case MessageType.Error:
            console.error('[Downloader] received error message:', message.error)
            setErrorMessage(message.error)
            conn.close()
            break
          case MessageType.Report:
            console.log('[Downloader] received report message, redirecting')
            window.location.href = '/reported'
            break
        }
      } catch (err) {
        console.error('[Downloader] error handling message:', err)
      }
    }

    const handleClose = () => {
      console.log('[Downloader] connection closed')
      setRotating(false)
      setDataConnection(null)
      setIsConnected(false)
      setIsDownloading(false)
    }

    const handleError = (err: Error) => {
      console.error('[Downloader] connection error:', err)
      setErrorMessage(cleanErrorMessage(err.message))
      if (conn.open) conn.close()
      else handleClose()
    }

    conn.on('open', handleOpen)
    conn.on('data', handleData)
    conn.on('error', handleError)
    conn.on('close', handleClose)
    peer.on('error', handleError)

    return () => {
      console.log('[Downloader] cleaning up connection')
      if (conn.open) {
        conn.close()
      } else {
        conn.once('open', () => {
          conn.close()
        })
      }

      conn.off('open', handleOpen)
      conn.off('data', handleData)
      conn.off('error', handleError)
      conn.off('close', handleClose)
      peer.off('error', handleError)
    }
  }, [peer])

  const submitPassword = useCallback(
    (pass: string) => {
      if (!dataConnection) return
      console.log('[Downloader] submitting password')
      dataConnection.send({
        type: MessageType.UsePassword,
        password: pass,
      } as z.infer<typeof Message>)
    },
    [dataConnection],
  )

  const startDownload = useCallback(() => {
    if (!filesInfo || !dataConnection) return
    console.log('[Downloader] starting download')
    setIsDownloading(true)
    setBytesDownloaded(0);

    if (isMobile) {
      console.log('[Downloader] Mobile device detected, using Blob download.');
      const fileChunks: Record<string, Uint8Array[]> = {};
      const receivedFinalFlags: Record<string, boolean> = {};
      let currentBytesDownloaded = 0; // Use a local var for updates within the closure

      // Define the chunk processor ONCE
      processChunk.current = (message: z.infer<typeof ChunkMessage>) => {
        const fileName = message.fileName;
        const chunk = new Uint8Array(message.bytes as ArrayBuffer);

        // Initialize chunks array if first chunk for this file
        if (!fileChunks[fileName]) {
          fileChunks[fileName] = [];
        }
        fileChunks[fileName].push(chunk);

        // Update byte count
        currentBytesDownloaded += chunk.byteLength;
        setBytesDownloaded(currentBytesDownloaded);

        // Check if this is the final chunk for THIS file
        if (message.final) {
          console.log('[Downloader] finished receiving (mobile)', fileName);
          receivedFinalFlags[fileName] = true;

          // Check if ALL files have received their final chunk
          const allFilesReceived = filesInfo.every(info => receivedFinalFlags[info.fileName]);

          if (allFilesReceived) {
            console.log('[Downloader] All files received (mobile), creating Blobs...');
            try {
                if (filesInfo.length === 1) {
                    const fileInfo = filesInfo[0];
                    const blob = new Blob(fileChunks[fileInfo.fileName], { type: fileInfo.type });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileInfo.fileName.replace(/^\//, '');
                    document.body.appendChild(a);
                    a.click();
                    console.log('[Downloader] Single file download triggered (mobile)');
                    // Delay revoke slightly to ensure download starts
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        console.log('[Downloader] Blob URL revoked (mobile)');
                    }, 100);
                } else {
                    console.warn('[Downloader] Multi-file download as ZIP on mobile is not fully supported via Blob method. Triggering first file download.');
                    if (filesInfo.length > 0 && fileChunks[filesInfo[0].fileName]) {
                      const fileInfo = filesInfo[0];
                      const blob = new Blob(fileChunks[fileInfo.fileName], { type: fileInfo.type });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = fileInfo.fileName.replace(/^\//, '');
                      document.body.appendChild(a);
                      a.click();
                      console.log('[Downloader] First file download triggered (mobile, multi)');
                      setTimeout(() => {
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          console.log('[Downloader] Blob URL revoked (mobile, multi)');
                      }, 100);
                    } else {
                      setErrorMessage("Could not prepare files for download on mobile.");
                    }
                }
                dataConnection.send({ type: MessageType.Done } as z.infer<typeof Message>);
                setDone(true);
                setRotating(false);
             } catch (error) {
                 console.error("[Downloader] Error during Blob creation/download (mobile):", error);
                 setErrorMessage(`Failed to prepare download: ${error.message}`);
                 setDone(false);
                 setIsDownloading(false);
                 setRotating(false);
             }
          } else {
            // Not all files are finished, request the next UNFINISHED file
            const currentFileIndex = filesInfo.findIndex(info => info.fileName === fileName);
            let nextFileIndex = -1;
            for (let i = 0; i < filesInfo.length; i++) {
                // Find the first file after the current one that hasn't finished
                const checkIndex = (currentFileIndex + 1 + i) % filesInfo.length;
                if (!receivedFinalFlags[filesInfo[checkIndex].fileName]) {
                    nextFileIndex = checkIndex;
                    break;
                }
            }

            if (nextFileIndex !== -1) {
                console.log('[Downloader] Requesting next file (mobile):', filesInfo[nextFileIndex].fileName);
                dataConnection.send({
                  type: MessageType.Start,
                  fileName: filesInfo[nextFileIndex].fileName,
                  offset: 0,
                } as z.infer<typeof Message>);
            } else {
                // Should not happen if allFilesReceived check is correct
                console.warn('[Downloader] Logic error: Final chunk received, but not all files marked done, and no next file found?');
            }
          }
        }
      }; // End of processChunk.current definition

      // Initial request for the first file
      if (filesInfo.length > 0) {
        console.log('[Downloader] Requesting first file (mobile - initial):', filesInfo[0].fileName);
        dataConnection.send({
            type: MessageType.Start,
            fileName: filesInfo[0].fileName,
            offset: 0,
          } as z.infer<typeof Message>);
      }
    } else {
      console.log('[Downloader] Desktop device detected, using StreamSaver.');
      const fileStreamByPath: Record<
        string,
        {
          stream: ReadableStream<Uint8Array>
          enqueue: (chunk: Uint8Array) => void
          close: () => void
        }
      > = {}
      const fileStreams = filesInfo.map((info) => {
        let enqueue: ((chunk: Uint8Array) => void) | null = null
        let close: (() => void) | null = null
        const stream = new ReadableStream<Uint8Array>({
          start(ctrl) {
            enqueue = (chunk: Uint8Array) => ctrl.enqueue(chunk)
            close = () => ctrl.close()
          },
        })
        if (!enqueue || !close)
          throw new Error('Failed to initialize stream controllers')
        fileStreamByPath[info.fileName] = { stream, enqueue, close }
        return stream
      })

      let totalReceivedBytesDesktop = 0;
      let nextFileIndex = 0
      const receivedFinalFlagsDesktop: Record<string, boolean> = {};

      const startNextFileOrFinish = () => {
        const allFilesReceived = filesInfo.every(info => receivedFinalFlagsDesktop[info.fileName]);
        if (allFilesReceived) {
            console.log('[Downloader] All files finished on desktop.');
            return;
        }

        while (nextFileIndex < filesInfo.length && receivedFinalFlagsDesktop[filesInfo[nextFileIndex].fileName]) {
            nextFileIndex++;
        }

        if (nextFileIndex >= filesInfo.length) {
            console.log('[Downloader] All files requested / finished on desktop.');
            return;
        }

        console.log(
          '[Downloader] starting next file (desktop):',
          filesInfo[nextFileIndex].fileName,
        )
        dataConnection.send({
          type: MessageType.Start,
          fileName: filesInfo[nextFileIndex].fileName,
          offset: 0,
        } as z.infer<typeof Message>)
      }

      processChunk.current = (message: z.infer<typeof ChunkMessage>) => {
        const fileStream = fileStreamByPath[message.fileName]
        if (!fileStream) {
          console.error('[Downloader] no stream found for', message.fileName)
          return
        }
        const chunk = new Uint8Array(message.bytes as ArrayBuffer);
        totalReceivedBytesDesktop += chunk.byteLength;
        setBytesDownloaded(totalReceivedBytesDesktop);
        fileStream.enqueue(chunk);

        if (message.final) {
          console.log('[Downloader] finished receiving (desktop)', message.fileName)
          receivedFinalFlagsDesktop[message.fileName] = true;
          fileStream.close()
          const allFilesReceived = filesInfo.every(info => receivedFinalFlagsDesktop[info.fileName]);
           if (!allFilesReceived) {
             startNextFileOrFinish()
           } else {
             console.log("[Downloader] Desktop: All files have received final chunk.");
           }
        }
      }

      const downloads = filesInfo.map((info, i) => ({
        name: info.fileName.replace(/^\//, ''),
        size: info.size,
        stream: () => fileStreams[i],
      }))

      const downloadPromise =
        downloads.length > 1
          ? streamDownloadMultipleFiles(downloads, getZipFilename())
          : streamDownloadSingleFile(downloads[0], downloads[0].name)

      downloadPromise
        .then(() => {
          console.log('[Downloader] StreamSaver download promise resolved.')
          const allFilesReceived = filesInfo.every(info => receivedFinalFlagsDesktop[info.fileName]);
          if(allFilesReceived) {
            console.log('[Downloader] all files downloaded successfully (desktop)')
            dataConnection.send({ type: MessageType.Done } as z.infer<
              typeof Message
            >)
            setDone(true)
            setRotating(false);
          } else {
             console.warn('[Downloader] StreamSaver finished, but not all final flags processed? Waiting.');
             setTimeout(() => {
                const allFilesReceivedAfterTimeout = filesInfo.every(info => receivedFinalFlagsDesktop[info.fileName]);
                if (allFilesReceivedAfterTimeout) {
                    console.log('[Downloader] All files downloaded successfully after timeout (desktop)')
                    dataConnection.send({ type: MessageType.Done } as z.infer<typeof Message>);
                    setDone(true);
                    setRotating(false);
                } else {
                     console.error('[Downloader] Download stream finished, but final flags missing. Download might be incomplete.');
                     setErrorMessage('Download finished, but verification failed. Files might be incomplete.');
                     setRotating(false);
                }
             }, 500);
          }
        })
        .catch((err) => {
            console.error('[Downloader] download error (desktop):', err);
            setErrorMessage(`Download failed: ${err.message}`);
            setRotating(false);
            if (dataConnection && dataConnection.open) {
                dataConnection.close();
            }
        })

      startNextFileOrFinish()
    }
  }, [dataConnection, filesInfo])

  const stopDownload = useCallback(() => {
    if (dataConnection) {
      console.log('[Downloader] pausing download')
      dataConnection.send({ type: MessageType.Pause })
      dataConnection.close()
    }
    setIsDownloading(false)
    setDone(false)
    setBytesDownloaded(0)
    setErrorMessage(null)
  }, [dataConnection])

  return {
    filesInfo,
    isConnected,
    isPasswordRequired,
    isDownloading,
    isDone,
    errorMessage,
    submitPassword,
    startDownload,
    stopDownload,
    totalSize: filesInfo?.reduce((acc, info) => acc + info.size, 0) ?? 0,
    bytesDownloaded,
  }
}

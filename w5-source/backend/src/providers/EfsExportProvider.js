import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { env } from '~/config/environment'
import { BadRequestErrorResponse, NotFoundErrorResponse } from '~/core/error.response'

const EXPORT_ID_RULE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return crc >>> 0
})

const crc32 = (buffer) => {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

const createStoredZip = ({ fileName, content }) => {
  const fileNameBuffer = Buffer.from(fileName)
  const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content)
  const checksum = crc32(contentBuffer)
  const localHeaderOffset = 0

  const localHeader = Buffer.alloc(30)
  localHeader.writeUInt32LE(0x04034b50, 0)
  localHeader.writeUInt16LE(20, 4)
  localHeader.writeUInt16LE(0, 6)
  localHeader.writeUInt16LE(0, 8)
  localHeader.writeUInt16LE(0, 10)
  localHeader.writeUInt16LE(0, 12)
  localHeader.writeUInt32LE(checksum, 14)
  localHeader.writeUInt32LE(contentBuffer.length, 18)
  localHeader.writeUInt32LE(contentBuffer.length, 22)
  localHeader.writeUInt16LE(fileNameBuffer.length, 26)
  localHeader.writeUInt16LE(0, 28)

  const centralDirectoryOffset =
    localHeader.length + fileNameBuffer.length + contentBuffer.length

  const centralDirectory = Buffer.alloc(46)
  centralDirectory.writeUInt32LE(0x02014b50, 0)
  centralDirectory.writeUInt16LE(20, 4)
  centralDirectory.writeUInt16LE(20, 6)
  centralDirectory.writeUInt16LE(0, 8)
  centralDirectory.writeUInt16LE(0, 10)
  centralDirectory.writeUInt16LE(0, 12)
  centralDirectory.writeUInt16LE(0, 14)
  centralDirectory.writeUInt32LE(checksum, 16)
  centralDirectory.writeUInt32LE(contentBuffer.length, 20)
  centralDirectory.writeUInt32LE(contentBuffer.length, 24)
  centralDirectory.writeUInt16LE(fileNameBuffer.length, 28)
  centralDirectory.writeUInt16LE(0, 30)
  centralDirectory.writeUInt16LE(0, 32)
  centralDirectory.writeUInt16LE(0, 34)
  centralDirectory.writeUInt16LE(0, 36)
  centralDirectory.writeUInt32LE(0, 38)
  centralDirectory.writeUInt32LE(localHeaderOffset, 42)

  const centralDirectorySize = centralDirectory.length + fileNameBuffer.length

  const endOfCentralDirectory = Buffer.alloc(22)
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0)
  endOfCentralDirectory.writeUInt16LE(0, 4)
  endOfCentralDirectory.writeUInt16LE(0, 6)
  endOfCentralDirectory.writeUInt16LE(1, 8)
  endOfCentralDirectory.writeUInt16LE(1, 10)
  endOfCentralDirectory.writeUInt32LE(centralDirectorySize, 12)
  endOfCentralDirectory.writeUInt32LE(centralDirectoryOffset, 16)
  endOfCentralDirectory.writeUInt16LE(0, 20)

  return Buffer.concat([
    localHeader,
    fileNameBuffer,
    contentBuffer,
    centralDirectory,
    fileNameBuffer,
    endOfCentralDirectory
  ])
}

const ensureExportId = (exportId) => {
  if (!EXPORT_ID_RULE.test(exportId)) {
    throw new BadRequestErrorResponse('Invalid export id.')
  }
}

class EfsExportProvider {
  static root = env.EFS_EXPORT_ROOT

  static getWorkspaceExportDir(workspaceId) {
    return path.join(this.root, workspaceId)
  }

  static getExportPaths({ workspaceId, exportId }) {
    ensureExportId(exportId)

    const baseDir = this.getWorkspaceExportDir(workspaceId)
    const fileName = `workspace-${workspaceId}-${exportId}.zip`

    return {
      baseDir,
      fileName,
      filePath: path.join(baseDir, fileName),
      metadataPath: path.join(baseDir, `${exportId}.json`)
    }
  }

  static async createWorkspaceExport({ workspaceId, payload }) {
    const exportId = crypto.randomUUID()
    const { baseDir, fileName, filePath, metadataPath } = this.getExportPaths({
      workspaceId,
      exportId
    })

    await fs.mkdir(baseDir, { recursive: true })

    const jsonContent = JSON.stringify(payload, null, 2)
    const zipContent = createStoredZip({
      fileName: `workspace-${workspaceId}.json`,
      content: jsonContent
    })

    await fs.writeFile(filePath, zipContent, { flag: 'wx' })

    const stats = await fs.stat(filePath)
    const metadata = {
      exportId,
      workspaceId,
      fileName,
      filePath,
      size: stats.size,
      createdAt: new Date().toISOString()
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), {
      flag: 'wx'
    })

    return metadata
  }

  static async getWorkspaceExport({ workspaceId, exportId }) {
    const { metadataPath } = this.getExportPaths({ workspaceId, exportId })

    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'))
      await fs.access(metadata.filePath)
      return metadata
    } catch (error) {
      throw new NotFoundErrorResponse('Export file not found.')
    }
  }
}

export default EfsExportProvider

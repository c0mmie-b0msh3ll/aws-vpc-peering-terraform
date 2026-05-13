import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'
import path from 'path'
import { env } from '~/config/environment'
class S3Provider {
  static client = new S3Client({
    region: env.AWS_REGION
  })

  static bucket = env.AWS_S3_BUCKET
  static cloudfront = env.AWS_CLOUDFRONT_DOMAIN

  static buildKey(folder, fileName) {
    const ext = path.extname(fileName).toLowerCase()
    return `${folder}/${crypto.randomUUID()}${ext}`
  }

  static getUrl(key) {
    return `https://${this.cloudfront}/${key}`
  }

  static async upload(file, folder = 'uploads') {
    const key = this.buildKey(folder, file.originalname)

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    )

    return {
      fileName: file.originalname,
      fileKey: key,
      fileType: file.mimetype,
      fileSize: file.size
    }
  }

  static async uploadMany(files = [], folder = 'uploads') {
    return Promise.all(files.map((file) => this.upload(file, folder)))
  }

  static async delete(key) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    )
  }

  static async deleteMany(keys = []) {
    if (!keys.length) return

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((key) => ({ Key: key })) }
      })
    )
  }

  static async getSignedDownloadUrl({ key, fileName, expiresIn = 60 * 5 }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName || 'file'}"`
    })

    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn
    })

    return downloadUrl
  }
}

export default S3Provider

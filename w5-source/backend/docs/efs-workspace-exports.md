# EFS workspace exports

The backend can write workspace export ZIP files to a shared EFS mount so any
EC2 instance behind the load balancer can create, download, or clean up the
same export files.

## Application config

Set this environment variable on every backend EC2 instance:

```bash
EFS_EXPORT_ROOT=/mnt/taskio-shared/exports
```

The API writes files under:

```bash
/mnt/taskio-shared/exports/<workspaceId>/
```

## API endpoints

Create an export:

```http
POST /v1/workspaces/:workspaceId/exports
Authorization: Bearer <access-token>
```

Download an export:

```http
GET /v1/workspaces/:workspaceId/exports/:exportId/download
Authorization: Bearer <access-token>
```

Both endpoints require the existing `workspace.view` permission.

## EC2/EFS setup

Create an EFS filesystem in the same VPC as the backend EC2 instances and add
mount targets in the private subnets/AZs used by the backend.

Security groups:

- EFS security group: allow inbound TCP `2049` from the backend EC2 security group.
- Backend EC2 security group: allow outbound TCP `2049` to the EFS security group.

Install the EFS mount helper and mount the filesystem:

```bash
sudo yum install -y amazon-efs-utils
sudo mkdir -p /mnt/taskio-shared
sudo mount -t efs -o tls fs-xxxxxxxx:/ /mnt/taskio-shared
sudo mkdir -p /mnt/taskio-shared/exports
sudo chown -R ec2-user:ec2-user /mnt/taskio-shared/exports
```

Persist the mount in `/etc/fstab`:

```bash
fs-xxxxxxxx:/ /mnt/taskio-shared efs _netdev,tls 0 0
```

## Cleanup

Exports are private generated files. Add a scheduled cleanup job on one worker
or EC2 instance to delete old files from `/mnt/taskio-shared/exports`, for
example files older than 24 hours.

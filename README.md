# TaskIO W5 Infrastructure Handoff

Repo nay la buoc foundation cho W5 deploy:

1. Dung Terraform trong repo nay de tao network foundation:
   - VPC application
   - VPC AI
   - Public/private subnets
   - NAT Gateway
   - Route tables
   - VPC Peering 2 chieu
   - VPC Flow Logs

2. Sau khi network foundation xong, deploy cac layer tiep theo bang AWS Console hoac AWS CLI:
   - Backend EC2 Auto Scaling Group + ALB
   - EFS shared storage cho workspace export
   - AI Lambda runtime
   - REST API Gateway + API Key + Usage Plan
   - CloudFront/S3 frontend

Tai lieu chi tiet:

- Terraform VPC/Peering: [_vpc_guide.md](./_vpc_guide.md)
- Terraform commands: [command_guide.md](./command_guide.md)
- Full deploy handoff: [docs/w5-deploy-handoff.md](./docs/w5-deploy-handoff.md)
- CloudFormation reference only: [w5-cloudformation/](./w5-cloudformation/)
- App source snapshot de deploy/build lai:
  - Backend API: [w5-source/backend/](./w5-source/backend/)
  - Frontend web: [w5-source/frontend/](./w5-source/frontend/)
  - AI Lambdas: [w5-source/lambdas/](./w5-source/lambdas/)

Note quan trong:

- Flow chuan cua team: dung Terraform VPC/Peering lam buoc 1, sau do deploy cac resource W5 bang AWS Console hoac AWS CLI.
- `w5-cloudformation/cloudformation/w5-foundation.all-in-one.yaml` la ban tham khao/all-in-one da dung de validate architecture. File nay co tao VPC rieng, khong phai flow deploy chinh cua team.
- `terraform.tfstate` dang ton tai trong repo goc. Neu dung cho moi truong that, nen move state sang S3 backend + DynamoDB lock va remove state file khoi git.
- Cac file runtime/secret nhu `.env`, `.env.production`, zip lambda, `node_modules`, build output va PEM private key khong commit vao repo nay. Dung `.env.example`, SSM Parameter Store va Secrets Manager de cau hinh khi deploy.

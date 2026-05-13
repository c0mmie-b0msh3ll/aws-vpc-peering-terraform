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

2. Sau khi network foundation xong, deploy cac layer tiep theo:
   - Backend EC2 Auto Scaling Group + ALB
   - EFS shared storage cho workspace export
   - AI Lambda runtime
   - REST API Gateway + API Key + Usage Plan
   - CloudFront/S3 frontend

Tai lieu chi tiet:

- Terraform VPC/Peering: [_vpc_guide.md](./_vpc_guide.md)
- Terraform commands: [command_guide.md](./command_guide.md)
- Full deploy handoff: [docs/w5-deploy-handoff.md](./docs/w5-deploy-handoff.md)
- CloudFormation source tham khao/chay CLI: [w5-cloudformation/](./w5-cloudformation/)

Note quan trong:

- `w5-cloudformation/cloudformation/w5-foundation.all-in-one.yaml` la ban all-in-one da dung trong qua trinh deploy hien tai. File nay co tao VPC rieng.
- Neu team di theo flow chuan cua repo nay, hay dung Terraform VPC/Peering lam buoc 1, roi dung cac template/backend/API phia sau voi outputs tu Terraform.
- `terraform.tfstate` dang ton tai trong repo goc. Neu dung cho moi truong that, nen move state sang S3 backend + DynamoDB lock va remove state file khoi git.

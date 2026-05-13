# VPC Stack Guide (De Hieu)

## 1) Stack nay lam gi?
Stack Terraform nay tao mot he thong mang AWS gom:
- 2 VPC: `vpc-application` va `vpc-ai`
- Moi VPC co:
- 2 public subnets
- 2 private subnets
- 1 Internet Gateway
- 2 NAT Gateways (moi AZ 1 NAT)
- Route table cho public va private
- VPC Flow Logs day vao CloudWatch Logs
- VPC Peering giua 2 VPC
- Route peering cho ca public va private route tables

Muc tieu: EC2 trong 2 VPC co the giao tiep voi nhau (private IP), dong thoi private subnet van di Internet qua NAT.

## 2) So do logic nhanh
- `vpc-application` CIDR mac dinh: `10.0.0.0/16`
- Public subnets: `10.0.1.0/24`, `10.0.2.0/24`
- Private subnets: `10.0.11.0/24`, `10.0.12.0/24`

- `vpc-ai` CIDR mac dinh: `10.1.0.0/16`
- Public subnets: `10.1.1.0/24`, `10.1.2.0/24`
- Private subnets: `10.1.11.0/24`, `10.1.12.0/24`

- Peering:
- `10.0.0.0/16 <-> 10.1.0.0/16`
- Route duoc tao cho:
- Public RT 2 ben
- Tat ca private RT 2 ben

## 3) Cac file chinh va vai tro
- `vpc-application.tf`
- Khai bao Terraform version, provider AWS, va goi module tao VPC application.

- `vpc-ai.tf`
- Goi module tao VPC ai.

- `peering.tf`
- Tao `aws_vpc_peering_connection`.
- Tao route peering cho private route tables.
- Tao route peering cho public route tables.

- `variables.tf`
- Chua bien dau vao: region, CIDR, subnet CIDRs, retention flow logs, ten peering.

- `outputs.tf`
- In ra: `application_vpc_id`, `ai_vpc_id`, `vpc_peering_connection_id`.

- `modules/vpc/main.tf`
- Module dung chung cho moi VPC.
- Tao VPC, subnets, IGW, route tables, NAT/EIP, flow logs, IAM role/policy.

- `modules/vpc/variables.tf`
- Dinh nghia input cua module VPC.

- `modules/vpc/outputs.tf`
- Xuat cac ID can thiet de root module dung tiep (vpc id, route tables, subnets...).

## 4) Luong route trong stack
- Public subnet:
- `0.0.0.0/0` -> IGW (ra Internet)
- CIDR VPC ben kia -> VPC Peering (noi VPC-to-VPC)

- Private subnet:
- `0.0.0.0/0` -> NAT Gateway cung AZ (ra Internet an toan hon)
- CIDR VPC ben kia -> VPC Peering

## 5) Cach deploy
1. Dam bao AWS credentials da set dung account/region.
2. Vao thu muc project:
   `cd /Users/ductiennguyen/Desktop/W5`
3. Init:
   `terraform init`
4. Kiem tra cau hinh:
   `terraform validate`
5. Xem thay doi:
   `terraform plan -out tfplan`
6. Deploy:
   `terraform apply tfplan`

## 6) Kiem tra sau deploy
- Xem outputs:
  `terraform output`
- Kiem tra route table:
- Public RT co route CIDR VPC con lai -> `pcx-...`
- Private RT co route CIDR VPC con lai -> `pcx-...`
- Test ket noi:
- Ping giua 2 EC2 bang private IP
- Neu fail, check `Security Group`, `NACL`

## 7) Loi hay gap
- Ping fail du peering Active:
- Thieu route o dung route table (public/private).
- Security Group khong cho ICMP.
- NACL custom chan traffic.
- Firewall trong OS chan ICMP (`firewalld`, `ufw`, `iptables`).

## 8) Chi phi can luu y
- NAT Gateway tinh phi theo gio + data processing.
- Stack hien tai co 4 NAT Gateways tong cong (2 moi VPC).
- CloudWatch Logs (Flow Logs) cung tinh phi luu tru va ingest logs.

## 9) Chinh nhanh cac bien hay doi
- `aws_region`
- `application_vpc_cidr`, `ai_vpc_cidr`
- `application_public_subnet_cidrs`, `application_private_subnet_cidrs`
- `ai_public_subnet_cidrs`, `ai_private_subnet_cidrs`
- `flow_log_retention_days`
- `peering_name`

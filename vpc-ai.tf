module "vpc_ai" {
  source = "./modules/vpc"

  name                    = var.ai_vpc_name
  vpc_cidr                = var.ai_vpc_cidr
  public_subnet_cidrs     = var.ai_public_subnet_cidrs
  private_subnet_cidrs    = var.ai_private_subnet_cidrs
  flow_log_retention_days = var.flow_log_retention_days
}

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc_application" {
  source = "./modules/vpc"

  name                    = var.application_vpc_name
  vpc_cidr                = var.application_vpc_cidr
  public_subnet_cidrs     = var.application_public_subnet_cidrs
  private_subnet_cidrs    = var.application_private_subnet_cidrs
  flow_log_retention_days = var.flow_log_retention_days
}

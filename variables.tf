variable "aws_region" {
  type        = string
  description = "AWS region to deploy"
  default     = "us-west-2"
}

variable "application_vpc_name" {
  type    = string
  default = "vpc-application"
}

variable "application_vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "application_public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "application_private_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "ai_vpc_name" {
  type    = string
  default = "vpc-ai"
}

variable "ai_vpc_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "ai_public_subnet_cidrs" {
  type    = list(string)
  default = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "ai_private_subnet_cidrs" {
  type    = list(string)
  default = ["10.1.11.0/24", "10.1.12.0/24"]
}

variable "flow_log_retention_days" {
  type    = number
  default = 30
}

variable "peering_name" {
  type    = string
  default = "vpc-application-ai-peering"
}

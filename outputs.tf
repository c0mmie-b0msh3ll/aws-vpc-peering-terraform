output "application_vpc_id" {
  value = module.vpc_application.vpc_id
}

output "ai_vpc_id" {
  value = module.vpc_ai.vpc_id
}

output "vpc_peering_connection_id" {
  value = aws_vpc_peering_connection.application_ai.id
}

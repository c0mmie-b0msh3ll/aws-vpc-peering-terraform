resource "aws_vpc_peering_connection" "application_ai" {
  vpc_id      = module.vpc_application.vpc_id
  peer_vpc_id = module.vpc_ai.vpc_id
  auto_accept = true

  tags = {
    Name = var.peering_name
  }
}

locals {
  application_private_rt_index_map = {
    for idx in range(length(var.application_private_subnet_cidrs)) :
    tostring(idx) => module.vpc_application.private_route_table_ids[idx]
  }

  ai_private_rt_index_map = {
    for idx in range(length(var.ai_private_subnet_cidrs)) :
    tostring(idx) => module.vpc_ai.private_route_table_ids[idx]
  }
}

resource "aws_route" "application_to_ai_private" {
  for_each                  = local.application_private_rt_index_map
  route_table_id            = each.value
  destination_cidr_block    = module.vpc_ai.vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.application_ai.id
}

resource "aws_route" "ai_to_application_private" {
  for_each                  = local.ai_private_rt_index_map
  route_table_id            = each.value
  destination_cidr_block    = module.vpc_application.vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.application_ai.id
}

resource "aws_route" "application_to_ai_public" {
  route_table_id            = module.vpc_application.public_route_table_id
  destination_cidr_block    = module.vpc_ai.vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.application_ai.id
}

resource "aws_route" "ai_to_application_public" {
  route_table_id            = module.vpc_ai.public_route_table_id
  destination_cidr_block    = module.vpc_application.vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.application_ai.id
}

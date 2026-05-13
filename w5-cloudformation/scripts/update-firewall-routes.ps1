param(
  [string]$Region = "us-east-1",
  [string]$StackName = "taskio-w5-foundation"
)

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Get-StackOutputValue {
  param([string]$Key)
  $stack = aws cloudformation describe-stacks `
    --region $Region `
    --stack-name $StackName `
    | ConvertFrom-Json

  return ($stack.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq $Key }).OutputValue
}

function Upsert-Route {
  param(
    [string]$RouteTableId,
    [string]$EndpointId
  )

  cmd /c "aws ec2 create-route --region $Region --route-table-id $RouteTableId --destination-cidr-block 0.0.0.0/0 --vpc-endpoint-id $EndpointId 2>NUL"

  if ($LASTEXITCODE -ne 0) {
    aws ec2 replace-route `
      --region $Region `
      --route-table-id $RouteTableId `
      --destination-cidr-block "0.0.0.0/0" `
      --vpc-endpoint-id $EndpointId | Out-Null
  }
}

$firewallName = Get-StackOutputValue "NetworkFirewallName"
$routeTableAz1 = Get-StackOutputValue "AppPrivateRouteTableAz1"
$routeTableAz2 = Get-StackOutputValue "AppPrivateRouteTableAz2"
$az1 = Get-StackOutputValue "AppPrivateSubnetAz1Name"
$az2 = Get-StackOutputValue "AppPrivateSubnetAz2Name"

$firewall = aws network-firewall describe-firewall `
  --region $Region `
  --firewall-name $firewallName `
  | ConvertFrom-Json

$endpointAz1 = $firewall.FirewallStatus.SyncStates.$az1.Attachment.EndpointId
$endpointAz2 = $firewall.FirewallStatus.SyncStates.$az2.Attachment.EndpointId

if (-not $endpointAz1 -or -not $endpointAz2) {
  throw "Could not resolve Network Firewall endpoints for $az1 and $az2."
}

Upsert-Route -RouteTableId $routeTableAz1 -EndpointId $endpointAz1
Upsert-Route -RouteTableId $routeTableAz2 -EndpointId $endpointAz2

Write-Host "Private app default routes now point to Network Firewall endpoints:"
Write-Host "$routeTableAz1 -> $endpointAz1 ($az1)"
Write-Host "$routeTableAz2 -> $endpointAz2 ($az2)"

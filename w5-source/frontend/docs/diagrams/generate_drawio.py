"""
Generate a professional draw.io AWS architecture diagram for Taskio.
Output: docs/diagrams/taskio_aws_architecture.drawio
"""

# ── AWS4 icon colors ──────────────────────────────────────────────────────────
C_NET  = '#8C4FFF'   # Networking (Route53, CloudFront, ALB, NAT)
C_COMP = '#ED7100'   # Compute    (ECS, Fargate, ECR)
C_DB   = '#C7131F'   # Database   (DynamoDB, ElastiCache)
C_SEC  = '#DD344C'   # Security   (WAF, Cognito, ACM, SecretsManager)
C_STG  = '#7AA116'   # Storage    (S3)
C_DEV  = '#C7131F'   # DevTools   (CodePipeline, CodeBuild)
C_MGMT = '#E7157B'   # Management (CloudWatch)
C_GEN  = '#232F3E'   # General    (User)

ICON_W = 60
ICON_H = 60

_id = [2]
cells = []

def nid():
    v = _id[0]; _id[0] += 1; return str(v)

def esc(s):
    """Escape special XML chars in attribute values."""
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def add_icon(label, icon, color, x, y, w=ICON_W, h=ICON_H):
    cid = nid()
    style = (
        f'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;'
        f'fillColor={color};labelBackgroundColor=none;align=center;html=1;'
        f'fontSize=11;fontStyle=0;aspect=fixed;pointerEvents=1;'
        f'shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.{icon};'
    )
    cells.append(
        f'<mxCell id="{cid}" value="{esc(label)}" style="{style}" '
        f'vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )
    return cid

def add_group(label, grIcon, fill, stroke, font_color,
              x, y, w, h, dashed=False, font_style=1):
    cid = nid()
    dash_attr = 'strokeDasharray=6,4;' if dashed else ''
    style = (
        f'points=[[0,0,0],[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0,0],'
        f'[1,0.25,0],[1,0.5,0],[1,0.75,0],[1,1,0],[0.75,1,0],[0.5,1,0],'
        f'[0.25,1,0],[0,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];'
        f'shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.{grIcon};'
        f'verticalLabelPosition=top;verticalAlign=bottom;'
        f'fillColor={fill};strokeColor={stroke};fontColor={font_color};'
        f'{dash_attr}fontSize=12;fontStyle={font_style};'
    )
    cells.append(
        f'<mxCell id="{cid}" value="{esc(label)}" style="{style}" '
        f'vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )
    return cid

def add_box(label, x, y, w, h, fill='#FFFDE7', stroke='#E3A902',
            font_color='#E3A902', font_style=1, dashed=True, font_size=12):
    cid = nid()
    dash_attr = 'dashed=1;strokeDasharray=6,4;' if dashed else ''
    style = (
        f'rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};'
        f'fontColor={font_color};fontSize={font_size};fontStyle={font_style};'
        f'verticalAlign=top;{dash_attr}'
    )
    cells.append(
        f'<mxCell id="{cid}" value="{esc(label)}" style="{style}" '
        f'vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )
    return cid

def add_label(label, x, y, w=140, h=24, bold=False):
    cid = nid()
    fs = 1 if bold else 0
    style = (
        f'text;html=1;strokeColor=none;fillColor=none;align=center;'
        f'verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle={fs};'
    )
    cells.append(
        f'<mxCell id="{cid}" value="{esc(label)}" style="{style}" '
        f'vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )
    return cid

def add_edge(src, tgt, label='', color='#545B64', dashed=False,
             ex=1, ey=0.5, nx=0, ny=0.5, style_extra=''):
    cid = nid()
    dash_attr = 'dashed=1;' if dashed else ''
    style = (
        f'edgeStyle=orthogonalEdgeStyle;html=1;rounded=0;'
        f'exitX={ex};exitY={ey};exitDx=0;exitDy=0;'
        f'entryX={nx};entryY={ny};entryDx=0;entryDy=0;'
        f'strokeColor={color};{dash_attr}{style_extra}'
    )
    cells.append(
        f'<mxCell id="{cid}" value="{esc(label)}" style="{style}" '
        f'edge="1" source="{src}" target="{tgt}" parent="1">'
        f'<mxGeometry relative="1" as="geometry"/>'
        f'</mxCell>'
    )
    return cid

# ═══════════════════════════════════════════════════════════════════════════════
# LAYOUT COORDINATES
# ═══════════════════════════════════════════════════════════════════════════════

# ── Left edge strip (x=50 for 60px icon, centered at 80) ────────────────────
LX  = 50   # left column x
LX2 = 170  # second left column x

# ── VPC box ──────────────────────────────────────────────────────────────────
VPC_X, VPC_Y, VPC_W, VPC_H = 290, 60, 1160, 970

# Public subnets band
PUB_X = VPC_X + 20
PUB_Y = VPC_Y + 70
PUB_W = VPC_W - 40
PUB_H = 130

# AZ rows
AZ_X = VPC_X + 20
AZ_W = VPC_W - 40

AZ1_Y = PUB_Y + PUB_H + 20
AZ1_H = 300

AZ2_Y = AZ1_Y + AZ1_H + 20
AZ2_H = 300

# App / DB subnets inside each AZ
APP_SW, APP_SH = 490, 240
DB_SW,  DB_SH  = 570, 240
SUBNET_INNER_Y_OFF = 50   # y offset of subnet group inside AZ group
SUBNET_GAP = 20

AZ1_APP_X = AZ_X + 20
AZ1_APP_Y = AZ1_Y + SUBNET_INNER_Y_OFF
AZ1_DB_X  = AZ1_APP_X + APP_SW + SUBNET_GAP
AZ1_DB_Y  = AZ1_APP_Y

AZ2_APP_X = AZ_X + 20
AZ2_APP_Y = AZ2_Y + SUBNET_INNER_Y_OFF
AZ2_DB_X  = AZ2_APP_X + APP_SW + SUBNET_GAP
AZ2_DB_Y  = AZ2_APP_Y

# CI/CD box (right of VPC)
CICD_X = VPC_X + VPC_W + 40
CICD_Y = VPC_Y
CICD_W = 200
CICD_H = 640

# Supporting services strip (below VPC)
SUP_Y = VPC_Y + VPC_H + 50

# ═══════════════════════════════════════════════════════════════════════════════
# DRAW GROUPS (must come before icons so they appear behind)
# ═══════════════════════════════════════════════════════════════════════════════

vpc_g = add_group('VPC', 'group_vpc',
    '#E6F3F8', '#147EBA', '#147EBA',
    VPC_X, VPC_Y, VPC_W, VPC_H)

pub_g = add_group('Public Subnets', 'group_public_subnet',
    '#F0F7FB', '#6BABCE', '#6BABCE',
    PUB_X, PUB_Y, PUB_W, PUB_H)

az1_g = add_group('Availability Zone 1', 'group_availability_zone',
    '#FAFAFA', '#E8A002', '#E8A002',
    AZ_X, AZ1_Y, AZ_W, AZ1_H, dashed=True)

az1_app_g = add_group('Private App Subnet', 'group_private_subnet',
    '#F1F8E9', '#5D8733', '#5D8733',
    AZ1_APP_X, AZ1_APP_Y, APP_SW, APP_SH)

az1_db_g = add_group('Private DB Subnet', 'group_private_subnet',
    '#F9F2FC', '#AF7AC5', '#AF7AC5',
    AZ1_DB_X, AZ1_DB_Y, DB_SW, DB_SH)

az2_g = add_group('Availability Zone 2', 'group_availability_zone',
    '#FAFAFA', '#E8A002', '#E8A002',
    AZ_X, AZ2_Y, AZ_W, AZ2_H, dashed=True)

az2_app_g = add_group('Private App Subnet', 'group_private_subnet',
    '#F1F8E9', '#5D8733', '#5D8733',
    AZ2_APP_X, AZ2_APP_Y, APP_SW, APP_SH)

az2_db_g = add_group('Private DB Subnet', 'group_private_subnet',
    '#F9F2FC', '#AF7AC5', '#AF7AC5',
    AZ2_DB_X, AZ2_DB_Y, DB_SW, DB_SH)

# CI/CD box
cicd_box = add_box('CI/CD Pipeline', CICD_X, CICD_Y, CICD_W, CICD_H,
    fill='#FFFDE7', stroke='#E3A902', font_color='#7D6608')

# ═══════════════════════════════════════════════════════════════════════════════
# DRAW ICONS
# ═══════════════════════════════════════════════════════════════════════════════

# ── Internet / Edge (left strip) ─────────────────────────────────────────────
user   = add_icon('Web Clients',      'user',                    C_GEN,  LX,  40)
dns    = add_icon('Route 53',         'route_53',                C_NET,  LX,  200)
cog    = add_icon('Cognito',          'cognito',                 C_SEC,  LX,  360)
acm    = add_icon('ACM',              'certificate_manager',     C_SEC,  LX2, 200)
cf     = add_icon('CloudFront',       'cloudfront',              C_NET,  LX,  500)
waf_cf = add_icon('WAF',              'waf',                     C_SEC,  LX2, 500)
s3_fe  = add_icon('S3  React App',    's3',                      C_STG,  LX,  640)

# ── Public Subnet icons ───────────────────────────────────────────────────────
PIY = PUB_Y + 35   # icons y inside public subnet
waf_alb = add_icon('WAF',              'waf',                     C_SEC,  PUB_X+40,  PIY)
alb     = add_icon('Load Balancer',    'application_load_balancer', C_NET, PUB_X+170, PIY)
nat1    = add_icon('NAT Gateway AZ-1', 'nat_gateway',             C_NET,  PUB_X+660, PIY)
nat2    = add_icon('NAT Gateway AZ-2', 'nat_gateway',             C_NET,  PUB_X+800, PIY)

# ── AZ1 icons ─────────────────────────────────────────────────────────────────
IY1 = AZ1_APP_Y + 90
ecs1     = add_icon('Amazon ECS',     'ecs',                     C_COMP, AZ1_APP_X+100, IY1)
fargate1 = add_icon('AWS Fargate',    'fargate',                 C_COMP, AZ1_APP_X+280, IY1)

DIY1 = AZ1_DB_Y + 90
cache1   = add_icon('ElastiCache\nPrimary', 'elasticache',       C_DB,   AZ1_DB_X+80,  DIY1)
dynamo   = add_icon('DynamoDB\n(VPC EP)',   'dynamodb',          C_DB,   AZ1_DB_X+300, DIY1)

# ── AZ2 icons ─────────────────────────────────────────────────────────────────
IY2 = AZ2_APP_Y + 90
ecs2     = add_icon('Amazon ECS',     'ecs',                     C_COMP, AZ2_APP_X+100, IY2)
fargate2 = add_icon('AWS Fargate',    'fargate',                 C_COMP, AZ2_APP_X+280, IY2)

DIY2 = AZ2_DB_Y + 90
cache2   = add_icon('ElastiCache\nReplica', 'elasticache',       C_DB,   AZ2_DB_X+80,  DIY2)
dynamo2  = add_icon('DynamoDB\n(VPC EP)',   'dynamodb',          C_DB,   AZ2_DB_X+300, DIY2)

# ── CI/CD icons ───────────────────────────────────────────────────────────────
CIX = CICD_X + 70
github  = add_icon('GitHub',         'codecommit',              C_GEN,  CIX, CICD_Y+50)
cpipe   = add_icon('CodePipeline',   'codepipeline',            C_DEV,  CIX, CICD_Y+200)
cbuild  = add_icon('CodeBuild',      'codebuild',               C_DEV,  CIX, CICD_Y+350)
ecr     = add_icon('Amazon ECR',     'ecr',                     C_COMP, CIX, CICD_Y+500)

# ── Supporting services (below VPC) ───────────────────────────────────────────
cw  = add_icon('CloudWatch',         'cloudwatch',              C_MGMT, VPC_X+30,  SUP_Y)
sm  = add_icon('Secrets Manager',    'secrets_manager',         C_SEC,  VPC_X+180, SUP_Y)

# ═══════════════════════════════════════════════════════════════════════════════
# EDGES
# ═══════════════════════════════════════════════════════════════════════════════

BLK  = '#545B64'
BLUE = '#147EBA'
GRN  = '#5D8733'
PRP  = '#AF7AC5'
ORG  = '#E3A902'
GRY  = '#999999'

# User → DNS (down)
add_edge(user,    dns,    '', BLK,  ex=0.5, ey=1, nx=0.5, ny=0)

# DNS → Cognito (down)
add_edge(dns,     cog,    '', BLK,  ex=0.5, ey=1, nx=0.5, ny=0)

# DNS → CF (down)
add_edge(cog,     cf,     '', BLK,  ex=0.5, ey=1, nx=0.5, ny=0)

# CF → WAF_CF (right)
add_edge(cf,      waf_cf, '', BLK,  ex=1, ey=0.5, nx=0, ny=0.5)

# CF → S3 (down)
add_edge(cf,      s3_fe,  '', BLK,  ex=0.5, ey=1, nx=0.5, ny=0)

# DNS → ALB  (right, with label)
add_edge(dns,     alb,    'api.taskio.com', BLUE, ex=1, ey=0.5, nx=0, ny=0.5)

# Cognito → ALB (dashed, JWKS)
add_edge(cog,     alb,    'JWT validation', GRY,  dashed=True, ex=1, ey=0.5, nx=0, ny=0.5)

# ACM → CF, ALB (dashed)
add_edge(acm,     cf,     'TLS cert', GRY,  dashed=True, ex=0.5, ey=1, nx=1, ny=0.5)
add_edge(acm,     alb,    '',         GRY,  dashed=True, ex=1,   ey=0.5, nx=0, ny=0.5)

# WAF_CF → WAF_ALB (conceptual flow arrow on WAF)
add_edge(waf_cf,  waf_alb,'',         GRY,  dashed=True, ex=1, ey=0.5, nx=0, ny=0.5)

# WAF_ALB → ALB
add_edge(waf_alb, alb,    '', BLK,    ex=1, ey=0.5, nx=0, ny=0.5)

# ALB → ECS x2
add_edge(alb,     ecs1,   '', BLUE,   ex=0.5, ey=1, nx=0.5, ny=0)
add_edge(alb,     ecs2,   '', BLUE,   ex=0.5, ey=1, nx=0.5, ny=0)

# ECS → Fargate
add_edge(ecs1,    fargate1, '', BLUE, ex=1, ey=0.5, nx=0, ny=0.5)
add_edge(ecs2,    fargate2, '', BLUE, ex=1, ey=0.5, nx=0, ny=0.5)

# Fargate → ElastiCache
add_edge(fargate1, cache1, '', PRP,   ex=1, ey=0.5, nx=0, ny=0.5)
add_edge(fargate2, cache2, '', PRP,   ex=1, ey=0.5, nx=0, ny=0.5)

# Fargate → DynamoDB
add_edge(fargate1, dynamo,  '', PRP,  ex=1, ey=0.5, nx=0, ny=0.5)
add_edge(fargate2, dynamo2, '', PRP,  ex=1, ey=0.5, nx=0, ny=0.5)

# ElastiCache replication (dashed, vertical)
add_edge(cache1,  cache2, 'replication', GRY, dashed=True, ex=0.5, ey=1, nx=0.5, ny=0)
add_edge(dynamo,  dynamo2,'shared table', GRY, dashed=True, ex=0.5, ey=1, nx=0.5, ny=0)

# Fargate → NAT (dashed, outbound internet)
add_edge(fargate1, nat1, 'outbound', GRY, dashed=True, ex=1, ey=0.5, nx=0, ny=0.5)
add_edge(fargate2, nat2, '',         GRY, dashed=True, ex=1, ey=0.5, nx=0, ny=0.5)

# CI/CD pipeline (vertical chain)
add_edge(github,  cpipe,  '', ORG, ex=0.5, ey=1, nx=0.5, ny=0)
add_edge(cpipe,   cbuild, '', ORG, ex=0.5, ey=1, nx=0.5, ny=0)
add_edge(cbuild,  ecr,    '', ORG, ex=0.5, ey=1, nx=0.5, ny=0)

# ECR → Fargate (deploy)
add_edge(ecr, fargate1, 'pull image', ORG, dashed=True, ex=0, ey=0.5, nx=1, ny=0.5)
add_edge(ecr, fargate2, '',           ORG, dashed=True, ex=0, ey=0.5, nx=1, ny=0.5)

# Fargate → CloudWatch + SecretsManager (dashed)
add_edge(fargate1, cw,  '', GRY, dashed=True, ex=0.5, ey=1, nx=0.5, ny=0)
add_edge(fargate1, sm,  '', GRY, dashed=True, ex=0.5, ey=1, nx=0.5, ny=0)

# ═══════════════════════════════════════════════════════════════════════════════
# ASSEMBLE XML
# ═══════════════════════════════════════════════════════════════════════════════

cells_xml = '\n        '.join(cells)

xml = f"""<mxfile host="app.diagrams.net" modified="2026-04-08" agent="Python generator" version="24.0.0" type="device">
  <diagram name="Taskio AWS Architecture" id="taskio-aws-arch">
    <mxGraphModel
      dx="1422" dy="762" grid="1" gridSize="10"
      guides="1" tooltips="1" connect="1" arrows="1" fold="1"
      page="1" pageScale="1" pageWidth="1900" pageHeight="1300"
      math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        {cells_xml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""

out = 'E:/bomb/taskio-web/docs/diagrams/taskio_aws_architecture.drawio'
with open(out, 'w', encoding='utf-8') as f:
    f.write(xml)

print(f"Generated: {out}")

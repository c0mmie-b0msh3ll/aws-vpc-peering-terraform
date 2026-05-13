from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import Route53, CloudFront, ALB, NATGateway
from diagrams.aws.compute import ECS, Fargate, ECR
from diagrams.aws.database import Dynamodb, ElasticacheForRedis
from diagrams.aws.security import WAF, Cognito, ACM, SecretsManager
from diagrams.aws.storage import S3
from diagrams.aws.devtools import Codepipeline, Codebuild
from diagrams.aws.management import Cloudwatch
from diagrams.onprem.client import Users
from diagrams.onprem.vcs import Github

graph_attr = {
    "fontsize": "13",
    "bgcolor": "#0d1117",
    "fontcolor": "#e6edf3",
    "pad": "0.8",
    "splines": "ortho",
    "nodesep": "0.6",
    "ranksep": "0.9",
}

node_attr = {
    "fontcolor": "#e6edf3",
    "fontsize": "11",
}

edge_attr = {
    "color": "#58a6ff",
    "fontcolor": "#8b949e",
    "fontsize": "10",
}

with Diagram(
    "Taskio — AWS 3-Tier Architecture",
    filename="E:/bomb/taskio-web/docs/diagrams/taskio_aws_architecture",
    outformat="png",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    users = Users("Web Clients")

    # ── Tier 1: Edge ────────────────────────────────────────────────────────
    with Cluster("Tier 1 — Edge & Presentation", graph_attr={"bgcolor": "#0d2818", "style": "rounded", "fontcolor": "#3fb950"}):
        dns      = Route53("Route 53\nDNS")
        acm      = ACM("ACM\nSSL/TLS")
        cognito  = Cognito("Cognito\nUser Pool")

        with Cluster("CloudFront Distribution", graph_attr={"bgcolor": "#0a2010", "fontcolor": "#3fb950"}):
            cf_waf = WAF("WAF\n(edge rules)")
            cf     = CloudFront("CloudFront\nCDN")
            s3_fe  = S3("S3\nReact App")
            cf_waf >> cf >> s3_fe

    # ── VPC ─────────────────────────────────────────────────────────────────
    with Cluster("VPC (Multi-AZ)", graph_attr={"bgcolor": "#0d1b2e", "style": "rounded", "fontcolor": "#58a6ff"}):

        with Cluster("Public Subnets", graph_attr={"bgcolor": "#0d1525", "fontcolor": "#388bfd"}):
            alb_waf = WAF("WAF\n(ALB rules)")
            alb     = ALB("Application\nLoad Balancer\n+ Cognito Auth")
            nat1    = NATGateway("NAT GW\nAZ-1")
            nat2    = NATGateway("NAT GW\nAZ-2")
            alb_waf >> alb

        # ── AZ 1 ────────────────────────────────────────────────────────────
        with Cluster("Availability Zone 1", graph_attr={"bgcolor": "#0d1f2e", "style": "dashed", "fontcolor": "#388bfd"}):
            with Cluster("Private App Subnet", graph_attr={"bgcolor": "#0a1a28"}):
                fargate1 = Fargate("ECS Fargate\nNode.js API")

            with Cluster("Private DB Subnet", graph_attr={"bgcolor": "#130f1f"}):
                redis1  = ElasticacheForRedis("ElastiCache\nRedis Primary")

        # ── AZ 2 ────────────────────────────────────────────────────────────
        with Cluster("Availability Zone 2", graph_attr={"bgcolor": "#0d1f2e", "style": "dashed", "fontcolor": "#388bfd"}):
            with Cluster("Private App Subnet", graph_attr={"bgcolor": "#0a1a28"}):
                fargate2 = Fargate("ECS Fargate\nNode.js API")

            with Cluster("Private DB Subnet", graph_attr={"bgcolor": "#130f1f"}):
                redis2  = ElasticacheForRedis("ElastiCache\nRedis Replica")

        # DynamoDB via VPC Endpoint (regional service, not AZ-bound)
        dynamo = Dynamodb("DynamoDB\n(VPC Endpoint)")

    # ── CI/CD ────────────────────────────────────────────────────────────────
    with Cluster("CI/CD Pipeline", graph_attr={"bgcolor": "#1a1a08", "style": "rounded", "fontcolor": "#e3b341"}):
        github       = Github("GitHub\n(source)")
        codepipeline = Codepipeline("CodePipeline")
        codebuild    = Codebuild("CodeBuild\n(Docker build)")
        ecr          = ECR("ECR\n(image registry)")
        github >> codepipeline >> codebuild >> ecr

    # ── Supporting ───────────────────────────────────────────────────────────
    with Cluster("Observability & Security", graph_attr={"bgcolor": "#161b22", "style": "rounded", "fontcolor": "#8b949e"}):
        cw = Cloudwatch("CloudWatch\nLogs & Alarms")
        sm = SecretsManager("Secrets\nManager")

    # ── Connections ──────────────────────────────────────────────────────────

    # User → DNS → Edge
    users >> Edge(color="#3fb950") >> dns
    dns >> Edge(color="#3fb950", label="taskio.com") >> cf_waf
    dns >> Edge(color="#58a6ff", label="api.taskio.com") >> alb_waf

    # ACM provides certs
    acm >> Edge(style="dashed", color="#8b949e") >> cf
    acm >> Edge(style="dashed", color="#8b949e") >> alb

    # Cognito validates at ALB
    cognito >> Edge(color="#e3b341", label="JWKS", style="dashed") >> alb

    # ALB → Fargate (both AZs)
    alb >> Edge(color="#58a6ff") >> fargate1
    alb >> Edge(color="#58a6ff") >> fargate2

    # Fargate → Data tier
    fargate1 >> Edge(color="#d2a8ff") >> dynamo
    fargate2 >> Edge(color="#d2a8ff") >> dynamo
    fargate1 >> Edge(color="#d2a8ff") >> redis1
    fargate2 >> Edge(color="#d2a8ff") >> redis1

    # Redis replication
    redis1 >> Edge(color="#8957e5", style="dashed", label="replication") >> redis2

    # NAT for outbound (Cloudinary, SES, etc.)
    fargate1 >> Edge(color="#484f58", style="dashed", label="outbound\n(Cloudinary/SES)") >> nat1
    fargate2 >> Edge(color="#484f58", style="dashed") >> nat2

    # ECR → Fargate (deploy)
    ecr >> Edge(color="#e3b341", label="pull image") >> fargate1
    ecr >> Edge(color="#e3b341") >> fargate2

    # Observability
    fargate1 >> Edge(color="#484f58", style="dashed") >> cw
    fargate2 >> Edge(color="#484f58", style="dashed") >> cw
    fargate1 >> Edge(color="#484f58", style="dashed") >> sm
    fargate2 >> Edge(color="#484f58", style="dashed") >> sm

print("Diagram generated: docs/diagrams/taskio_aws_architecture.png")

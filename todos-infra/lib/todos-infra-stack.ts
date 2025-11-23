import {
  Stack,
  StackProps,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";

export class TodosInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // -----------------------------
    // 1. VPC (2 public + 2 private)
    // -----------------------------
    const vpc = new ec2.Vpc(this, "NestVpc", {
      maxAzs: 2,
      natGateways: 1,
    });

    // -----------------------------
    // 2. ECR Repository
    // -----------------------------
    const repo = new ecr.Repository(this, "NestJsRepo", {
      repositoryName: "nestjs-app",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // -----------------------------
    // 3. RDS Postgres instance
    // -----------------------------
    const dbCredentials = new rds.DatabaseSecret(this, "DbSecret", {
      username: "postgres",
    });

    const rdsSG = new ec2.SecurityGroup(this, "RdsSG", {
      vpc,
      allowAllOutbound: true,
    });

    const db = new rds.DatabaseInstance(this, "PostgresDB", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      allocatedStorage: 20,
      maxAllocatedStorage: 50,
      securityGroups: [rdsSG],
      credentials: rds.Credentials.fromSecret(dbCredentials),
      publiclyAccessible: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // -----------------------------
    // 4. EC2 Instance
    // -----------------------------
    const ec2SG = new ec2.SecurityGroup(this, "Ec2SG", {
      vpc,
      allowAllOutbound: true,
    });

    // Allow EC2 -> RDS ingress
    rdsSG.addIngressRule(ec2SG, ec2.Port.tcp(5432), "Allow EC2 to access Postgres");

    // IAM Role for EC2 (pull images from ECR)
    const ec2Role = new iam.Role(this, "Ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
      ],
    });

    // User data script to install docker + run app
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      "sudo apt update -y",
      "sudo apt install docker.io -y",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",

      // login to ECR (uses IAM role, no creds)
      `aws ecr get-login-password --region ${this.region} | docker login --username AWS --password-stdin ${this.account}.dkr.ecr.${this.region}.amazonaws.com`,

      // Pull and run container
      `docker pull ${repo.repositoryUri}:latest`,

      // Run container
      `docker run -d --name nest-app -p 3000:3000 \
        -e DATABASE_URL=postgres://${dbCredentials.secretValueFromJson("username").unsafeUnwrap()}:${dbCredentials.secretValueFromJson("password").unsafeUnwrap()}@${db.dbInstanceEndpointAddress}:5432/postgres \
        ${repo.repositoryUri}:latest`
    );

    const ec2Instance = new ec2.Instance(this, "NestEc2", {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: new ec2.InstanceType("t3.micro"),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: ec2SG,
      role: ec2Role,
      userData,
    });

    // Allow SSH only from YOUR IP (optional)
    ec2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    ec2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000));

    // Outputs
    new cdk.CfnOutput(this, "EC2PublicIP", {
      value: ec2Instance.instancePublicIp,
    });

    new cdk.CfnOutput(this, "RDSEndpoint", {
      value: db.dbInstanceEndpointAddress,
    });

    new cdk.CfnOutput(this, "ECRRepoURI", {
      value: repo.repositoryUri,
    });
  }
}

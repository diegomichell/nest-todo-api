# Tasky AWS CDK Infrastructure

This directory contains the AWS CDK infrastructure code for deploying the Tasky application to AWS ECS Fargate.

## Architecture

The CDK stack creates the following resources:

- **VPC**: Multi-AZ VPC with public, private, and isolated subnets
- **ECR**: Container registry for Docker images
- **ECS Fargate**: Container orchestration with auto-scaling
- **RDS PostgreSQL**: Managed database in isolated subnets
- **Application Load Balancer**: Public-facing load balancer
- **Secrets Manager**: Secure storage for database and JWT credentials
- **CloudWatch Logs**: Centralized logging

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. AWS CDK CLI installed globally:
   ```bash
   npm install -g aws-cdk
   ```
4. Docker installed (for building images)

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure AWS credentials**
   ```bash
   aws configure
   ```

3. **Bootstrap CDK (first time only)**
   ```bash
   npm run bootstrap
   ```

   This creates the necessary AWS resources for CDK deployments in your account.

## Deployment

### 1. Deploy the Infrastructure

```bash
npm run deploy
```

This will:
- Create all AWS resources
- Output important values (ALB DNS, ECR URI, etc.)
- Take approximately 10-15 minutes

### 2. Build and Push Docker Image

After the infrastructure is deployed, build and push your Docker image:

```bash
# Get the ECR repository URI from the CDK output
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name TaskyStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryUri`].OutputValue' \
  --output text)

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build the image (from project root)
cd ..
docker build -t tasky-api .

# Tag the image
docker tag tasky-api:latest $ECR_URI:latest

# Push to ECR
docker push $ECR_URI:latest
```

### 3. Update ECS Service

The ECS service will automatically pull the new image on the next deployment or you can force a new deployment:

```bash
aws ecs update-service \
  --cluster tasky-cluster \
  --service tasky-service \
  --force-new-deployment
```

## Useful Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run cdk synth` - Synthesize CloudFormation template
- `npm run cdk diff` - Compare deployed stack with current state
- `npm run deploy` - Deploy the stack
- `cdk destroy` - Destroy the stack

## Stack Outputs

After deployment, the stack outputs important values:

- **LoadBalancerDNS**: The URL to access your API
- **ECRRepositoryUri**: The ECR repository for pushing Docker images
- **DatabaseEndpoint**: The RDS database endpoint
- **ClusterName**: The ECS cluster name
- **ServiceName**: The ECS service name

You can view these outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name TaskyStack \
  --query 'Stacks[0].Outputs'
```

## Environment Configuration

The ECS task uses the following environment variables:

- `NODE_ENV`: production
- `PORT`: 3000
- `DB_PORT`: 5432
- `DB_DATABASE`: tasky
- `DB_HOST`: (from RDS endpoint)
- `JWT_EXPIRATION`: 7d

Secrets (stored in AWS Secrets Manager):
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

## Auto-Scaling

The ECS service is configured with auto-scaling:

- **Min capacity**: 1 task
- **Max capacity**: 4 tasks
- **Target CPU utilization**: 70%
- **Scale-in cooldown**: 60 seconds
- **Scale-out cooldown**: 60 seconds

## Security

- Database is in isolated subnets (no internet access)
- ECS tasks are in private subnets
- Only the ALB is public-facing
- Security groups restrict access between resources
- Secrets are stored in AWS Secrets Manager
- Database backups enabled (7-day retention)

## Cost Optimization

To minimize costs:

1. Use appropriate instance sizes (currently T3 Micro for RDS)
2. Set min tasks to 1 (can be 0 for dev environments)
3. Use single NAT gateway (configured)
4. Enable RDS auto-scaling storage
5. Consider using RDS Aurora Serverless for variable workloads

## Troubleshooting

### Check ECS Task Status

```bash
aws ecs describe-services \
  --cluster tasky-cluster \
  --services tasky-service
```

### View Container Logs

```bash
aws logs tail /aws/ecs/tasky --follow
```

### Check Task Definition

```bash
aws ecs describe-task-definition \
  --task-definition TaskyTaskDef
```

### Test Database Connection

You can create a bastion host in the public subnet to test database connectivity:

```bash
# Connect to RDS via bastion host
psql -h <database-endpoint> -U postgres -d tasky
```

## Cleanup

To delete all resources:

```bash
cdk destroy
```

Note: RDS will create a final snapshot before deletion (configured with `removalPolicy: SNAPSHOT`).

## CI/CD Integration

The GitHub Actions workflow automatically:
1. Builds and tests the application
2. Pushes Docker image to ECR
3. Updates ECS service with new task definition

See `.github/workflows/deploy.yml` for details.

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)

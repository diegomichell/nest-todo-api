#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { TaskyStack } from '../lib/tasky-stack';

dotenv.config({ path: '../.env' });

const app = new cdk.App();

new TaskyStack(app, 'TaskyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Tasky NestJS API infrastructure with ECS Fargate, RDS, and ALB',
});

import {
  aws_s3 as s3,
  aws_ec2 as ec2,
  aws_eks as eks,
  Stack,
  StackProps,
  RemovalPolicy,
} from "aws-cdk-lib";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
  ManagedPolicy,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { KubectlV24Layer } from '@aws-cdk/lambda-layer-kubectl-v24';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc");

    const eksCluster = new eks.Cluster(this, 'EKSCluster', {
      vpc: vpc,
      defaultCapacity: 2, // default is 2 m5.large instances
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // creating 2 t3.micro ec2 instances for initial testing purposes
      version: eks.KubernetesVersion.V1_24,
      kubectlLayer: new KubectlV24Layer(this, 'kubectl')
    });


    eksCluster.addAutoScalingGroupCapacity('workerNodsASG', {
      instanceType: new ec2.InstanceType('t3.micro'),
      minCapacity: 1,
      maxCapacity: 100,
      // leaving in the following b/c we might need to specify kubelet extra arguments for adding labels/taints to nodes
      /*bootstrapOptions: {
        kubeletExtraArgs: '--node-labels foo=bar,goo=far',
        awsApiRetryAttempts: 5,
      },
      */
    });
  }
}

import {
  aws_s3 as s3,
  aws_ec2 as ec2,
  aws_eks as eks,
  aws_iam as iam,
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
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL), // exact size we need is tbd
      version: eks.KubernetesVersion.V1_24,
      kubectlLayer: new KubectlV24Layer(this, 'kubectl')
    });

    eksCluster.addAutoScalingGroupCapacity('workerNodsASG', {
      instanceType: new ec2.InstanceType('t3.small'),
      minCapacity: 1,
      maxCapacity: 100,
      // leaving in the following b/c we might need to specify kubelet extra arguments for adding labels/taints to nodes
      /*bootstrapOptions: {
        kubeletExtraArgs: '--node-labels foo=bar,goo=far',
        awsApiRetryAttempts: 5,
      },
      */
    });

    /* different attempt to attach necessary roles to ec2 instance nodes in the eks cluster
    const workerNodeRole = new iam.Role(this, 'node-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"), 
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy")
      ]
    });

    const nodeGroup = new eks.Nodegroup(this, 'WorkerNodeGroup', {
      cluster: eksCluster,
      nodeRole: workerNodeRole
    })
    

    const workerNodeRole = new iam.Role(this, 'node-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    workerNodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"));
    workerNodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"));
    workerNodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"));

    const nodeGroup = new eks.Nodegroup(this, 'WorkerNodeGroup', {
      cluster: eksCluster,
      nodeRole: workerNodeRole
    })
    //eks.CfnNodegroup...
    */

    eksCluster.addManifest('statsd-service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'statsd-service' },
      spec: {
        selector: { app: "statsd" },
        ports: [{ protocol: "UDP", port: 8125, targetPort: 8125 }],
        type: "ClusterIP"
      }
    });

    eksCluster.addManifest('statsd-deploy', { 
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'statsd' },
      spec: {
        selector: { matchLabels: { app: "statsd" } },
        replicas: 1,
        template: {
          metadata: { labels: { app: "statsd" }},
          spec: {
            containers: [{
              name: 'statsd', 
              image: 'public.ecr.aws/l7g9j7r7/edamame-statsite-amd64:latest', 
              ports:[{ 
                name: "statsd",
                containerPort: 8125 
              }] 
            }]
          }
        }
      }
    });

  }
}

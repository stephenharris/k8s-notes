- How does k8s interact with cloud services such as RDS/DynamoDB/Secrets/Redis or even lambdas/api-gateway
  K8S leverages ALB for load-balancer services.

- How does secret management work in practise? Do we have a persistant store for them? e.g. aws secrets?

- How to apply config changes without deleting the pod? Config (and secrets) values are independent of the pod, but if mounting them as an environment variable, the new values are not propogated to the new pods. The only way is to force a rollout of new pods. However, you can alternatively mount configs/secrets as volume mounts and these ARE automatically updated, albeit with some delay. Its "eventually consistent". The application might also 'cache' data from the file in memory and need to be told to re-read it. 

- How does `k exec` work if nodes are in the cloud, potentially in a private subnet?
  EKS handles the API server - its not an EC2 instance in a (private) subnet, but managed by AWS.

- How does k8s integrate with AWS?
  AWS provide EKS - they manage the master node, handle upgrades of k8s and the nodes, handle back-ups of etsd and ensure high avaialbility (multiple masters, etcd cluster, etc). This is largely hidden in the sense that you cannot see the master node.

- RBAC?

- How to scale pods/nodes in response to usage? - Horizontal pod autoscaler for pods. ASG in aws for nodes??
- How do you scale nodes in respond to load/latency/memory?

- How to 'protect' the master node? What if it goes down? How can you restore it? - High Availability (multiple master nodes, etcd based on consensus, load-balanced api servers, and single "nominated" scheduler & controller manger with others has fallback: https://kubernetes.io/docs/tasks/administer-cluster/highly-available-master/ - AWS EKS handles the master node, and high-availability across multiple AZs)

- Daemon sets?
  Are pods that are guranteed to run on each (or suset of nodes)

- What are configs? 
- What are contexts?
- How to switch between 'prod' and 'dev' environment?
- What are namespaces? - See 10-Namespaces.md
- Secrets are base64 encoded by default - how do encrypt them? Are there vendor-specific solutions? How does key rotation work?
- How to authenticate users?
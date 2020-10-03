
# Kubernetes

Kubernetes is a container orchistrator. It is responsible for starting up containers within a 'pod' and deploying those pods to nodes within the cluster. It provides infrastructure abstraction (e.g. our pods will request CPU and memory, and kubernetes will hanlding deploying the pods in a way in which those resource requirements are meant.)

Kubenernetes is *declarative*: you give it a desired state it handles the changes required to get the cluster into that desired state. It will also continuously and make changes to keep the desired state (e.g. if a a pod or node fails, or desired state changes)

Benefits:
 - Provides speed of deployment: You can quickly get code and environment from a developer's workstation to production quickly 
 - This speed allows iterative deployments quickly (aided by rollout strategies such as canary releases and blue/green deployments, as well as quick rollbacks)
 - Kubenerates can recover automatically and quickly (e.g. node goes down!)
 - It hides complexity (i.e. workload placement, storage & resource management are handled by kubenerates)


Principles:
 - Declarative configuration
 - Controllers (monitor state of system and ensure syste matches desired state)
 - There is one master (api server)

The 'access point' for Kubenernetes is its API. This is used by users to make changes to the cluster (such as release an application update), but also by individual components in Kubernetes to monitor the cluster and make changes. 

 - It's a RESTful API over HTTP using JSON
 - Resources are modelled as api objects (e.g. pods, services, deployments) 
 - Desired cluster state is manged through the API, in a declarative way
 - It's the sole way you and kubernetes interacts with your cluster

API objects include

 - **Pod** - which act as an environment for your containers to run in, as well other metedata such as label, liveness probes etc
 - **Controllers** - which monitor the system and keep it in a desired state (e.g. `ReplicaSet` and `Deployment`)
 - **Services** - persistant access point to pods (e.g load balancers, node ports)
 - **Storage** - provides persistant storage
 - and more

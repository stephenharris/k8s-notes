# Controller Manager

 Implement lifecycle management of controllers. They are two different:

 - kube-controller-manager: one per cluster. Responsible for keeping the cluster in the desired state.
 - cloud-controller-manager: allows cloud providers to build controller manager specific to their infrastructure/resources.

The controller manage effectively runs the controllers which themselves continuosly monitor current state and ensure that the desired state is maintained. There are broadly two types of controllers, **Pod Controllers** (ReplicaSet, Deployment, DaemonSet, StatefulSet, Job, CronJob) and **Other Controllers**:

 - Node - responsible for manages/monitoring state of nodes
 - Service - responsible for manages load balancer
 - Endpoint - updates/manages service endpoints for pods and services based on label selector (which pod ips belong to which services)
 - (and others)




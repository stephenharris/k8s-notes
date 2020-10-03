# Kubernetest Architecture



## Cluster components:

###  Master

The master performs the major control functions of a cluster. E.g.

  - it co-ordinates cluster functions
  - it performs monitoring
  - responsible for scheduling
  - acts as the primary access point for interacting with the cluster

The master is comprised of
 - **API server** (primary access point). All instructions pass through this. It's RESTful and persists its state to cluster store (etcd).
 - **Cluster store** (persists  cluster state to a key value store, etcd). Watches for changes and triggers events. 
 - **Scheduler** - determines which nodes to start pods on based on availability and requirements. Watches API server(?) and schedules pods, evaluates the pod requirements to determine
   which nodes to place pods. It repsects contraints, e.g. we might ask that two pods are always on the same node (node affinity) or the opposite (node anti-affinity).
 - **Controller Manager** - implementing lifecylce functions of the controllers (responsibility of keeping things in desired state). Watch the current state and update the API server to ensure desired state is respected. Examples include replicate set and deployemnts.



### Nodes

The worker nodes are where applications run. A node is responsible for

  - starting up/destroying pods
  - monitoring pod/services status
  - handling network communciation to ensure pods & services 

All nodes (including the 'master') are comprised of the following

 - **kubelet**:
    - Monitiors api server for changes
    - Responsile for starting/stopping lifecyle in response to response from API server
    - Reports node & pod state to API server
    - Executes pod liveness/readiness probes

 - **kube-proxy**: pod-networking and service abstraction.
    - responsible for networking for nodes
    - uses iptables (?)
    - routing traffic to pods
    - responsibility for load balancing evenly to the appropriate pods


 - **container runtime**: where the containeres are actually run. pulls images and starts contains.
     - download images
     - run containers
     - abstracts container runtime interface (default implementation is docker by default)


**Note:** By default the scheduler on the master will avoid deploying application pods on the master node. The master
node is typically reserved for running system pods.


### Scheduled/add ons

Provides that provide key services to the cluster itself.

E.g. coredns which provides a dns service to the cluster. The IPs of these pods and search-suffix domain are inserted into the newtorking configuration
of every pod created in the cluster. Pods, nodes and services will register their addresses with the dns pods.

Other examples include, ingress controller (http routing and load balancer) and the kubernetes dashboard.




## Networking


 | Component | Ports (TCP)  | Used by  | Notes |
 | --------- | ------------ | -------- | ----- |
 | API       | 6443         | All      |  |
 | etcd      | 2379-2380    | API/etcd | e.g. for replicas  |
 | Scheduler | 10251        | Self     | i.e. on localhost host, not exposed outside master |
 | CM        | 10252        | Self     | " - "  |
 | Kubelet   | 10250        | Control plane | On all nodes  |
 | NodePort  | 30000-32767  | All      | K8s service, exposes our services on ports on the node in this range |




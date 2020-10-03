# Services

Because pods are ephemeral and their IP addresses are apriori unknown, and changeable in order for our 
clients to talk to our pods, or for pods to talk to each other we need services. 

Services 

 - abstract Pod IP addresses from consumers, providing a persistant name/IP to address those pods
 - can load balance between those pods
 - Have fixed IP and DNS names. 

In short Services are networking abstraction for pod access. As pods are added/removed the services are updated to know which 'endpoints' belong them.

Labels are used to associate a servcie with a pod. Services are layer 4 (TCP/UDP over IP). Unlike pods, services are not ephemeral; they'll have a static IP.

kube-proxy (a pod daemonset) are responsible for implementing services, it exposes the service on the network. (The default and most common implementation is iptables). It will monitor the API server and has new pods are created it will update service configurations - e.g. iptable rules.


## Service types

 - **ClusterIP** - expose the service on a cluster-internal IP. This service is allocated an IP from our ClusterIP range. A pod which need to communicate to pods 'managed' by this service can do so by that IP. In doing so, the service provides a persistant IP for those pods. This service is not acessible outside of the cluster.
 - **NodePort** - expose the service on each node's IP at static port. This service is allocated the same port on all nodes, and it can be accessed using the real IP of the node and that port. Firewall rules allowing, traffic from outside the cluster can access that service via any node using the node IP/port pair. It builds on top of the ClusterIp as requests to the node's port is forwarded to a clusterIP service under the hood.
 - **LoadBalancer** - provision an external IP to act as a load balancer for the service. In practise an external IP is allocated to the load balancer (e.g. provisioned by your cloud provider). Under the hood a ClusterIP and NodePort is created and the LB will distribute traffic over each of the nodes on the NodePort port, which proxies to the ClusterIP and then which distributes traffic to the pod\* 
 - **ExternalName** - Maps a service to a DNS name

 \* This multi-layer hop might lead to ineffeciences. E.g. our external LB will distribute traffic evenly between nodes, but the pods being targetted might reside in a subset of our nodes.


### ClusterIP

A service which is exposed inernally within the cluster. Allow pods to talk to other pods, but anything
outside of this cluster cannot talk to the service.


### NodePort service

Exposes the service on each node's IP at static port. Each node proxes the allocated port to the service
(and then onto nodes).

This allows an external caller to call in.


### LoadBalancer

Exposes service external - and can be combined with a cloud provider's load balancer (e.g. AWS ALB).
Behind the scenes, NodePort and ClusterIP services are created. 

Calls from an external client are directed to the load balancer which then shares the traffic over one 
or more nodes. The nodes themselves have NodePorts set up which the load balancer uses (?) and ClusterIP
to allow pods to communicate with other pods (?).


### ExternalName Service

This service acts as an alias for an external services. E.g. there is some other domain or IP which 
our pods need to talk to, this service acts as a "gateway" for that service. Additional the details
of that service (e.g. the domain/IP) are hidden from the cluster - which allows us to change them 
without changing the pods. 


## Creating services

A NodePort service is behind the scenes (?) created when we do a port forward. It opens up a port on the node and proxies
to an instance. E.g.:

   k port-forward pod/[pod-name] 8080:80
   k port-forward deployment/[deployment-name] 8080:80 # a pod from the deployment is chosen to forward to?


Typically we'll create services declaratively in yaml files.

   k apply -f loadbalancer.service.yml


## Deleting services

   k delete -f loadbalancer.service.yml
   #k delete service [service name]

### Testing if pods can talk to each other

   k exec [pod-name] -- curl -s http://podIP

You may need to install curl

   k exec [pod-name] - it sh
   > apt-get install curl
   > curl -s http://podIP
   > curl http://clusterServiceIP
   > curl http://[clusterServiceName]

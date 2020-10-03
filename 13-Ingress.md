# Ingress

Ingress allow us to perform

 - named-based virtual hosts (e.g. host-header and path based routing)
 - load-balancing to endpoints
 - complex rule for external access to services
 - TLS/SSL termination

(For more information see Nigel Brown - Managing Ingress Traffic Patterns for Kubernetes).


Ingress controller

 - run in or next to your cluster (e.g. a nginx pod ina cluster, cloud balancer external ingress, eg. AWS ALB Ingress, external hardware)
 - ingress controllers have a defined spec?
 - ingress objects configure the ingress controller


Why ingress rather than LB?

 - Ingress is layer 7 (path based routing & name-based virtual)
 - They can impliment session stickyness
 - Url rewriting
 - dynamic waiting (?)
 - LB balance traffic on IP/port
 - LB will balance traffic over one service, Ingress can support multiple services
 - Reduced latency (traffic routed directly to endpoints from Ingress, rather than to Kube-Proxy and then potentially between nodes as with LB)

A common pattern is that an external/cloud load balancer is used to route traffic to our ingress controller which then routes traffic onto a clusterIP service based on host-header/path.


 

# Stateful Set

Enables stateful applications to be managed by a controller in Kubernetes.

E.g. database workloads, caching servers


In K8s whena Pod is new scheduled it is a completely new pod. For statefull applications, whe need that new pod to comeback with the same state.

So we need to decouple application state and application configuration from the lifecycle of the pod.

We can do that through:

 - persistant naming - unique identifiers for pods running in stateful sets (e.g. so clients of a DB know where to get the data from)
 - persistant storage - required so data can be stored outside and independently of the pod, and so that data can be retrieved by a future pod.
 - headless service - provides DNS to allow stateful pods to be accesse by name

Containers are ephmeral. Data written to the container is lost when the container is lost. When a pod is deleted, its container its deleted from the node. 



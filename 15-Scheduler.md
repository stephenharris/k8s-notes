# Scheduler

Decides which node to run a pod on based on resource requirements and policy restrictions (e.g. CPU, memory, storage, node affinity).
Default scheduler is `kube-scheduler`, but it can be replaced.
 
The scheduler watches the API server for new pods that are not currently scheduled to a node, and then performs node selection. The selected node is then updated in the pod object via the API server. Kubelets monitoring the API server see this new pod on their node and start the pod/container runtime.

## Node selection

Nod selection happens in three phases:

### Filtering

Remove nodes that cannot run our pod. E.g. is the node ready, does it have enough resources, does it have appropriate node labels?

In our pod definition we can (and should!) specify resource requirements. These are gurantees: our pods will not be placed on node unless that node can allocate it those resources (typically CPU and memory). The node is responsible for tracking how much available resource it has for user-defined pods, and communicating how much of those resources it can allocate for the new pods. If no node exists with sufficient resources, or which satisfies other constraints, the pod will go pending.

We can influence filtering by:

 - Using node selectors
   In the pod spec (`pod.spec.nodeSelector`), specify key-value pairs taht a node must have to accept the pod. Terraform lets us define node labels for our nodes. We can manage labels of nodes via kubectl in the same way as with pods.

 - Node & Pod affinity ???
   https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
   `pod.spec.affinity`

 - Taints & tolerations (opposite of node selectors)
   k taint nodes <nodename> <taint>

   Tolerations in pod spec (`pod.spec.tolerations`) - allow you to tell k8s to ignore a taint for particular pods.
 
 - Node cordoning (prevent a node from recieving new pods)
   Useful prior to node reboot / maintenance. To gracefully drain instances use

       k drain node <node> --ignore-daemonsets

 - Manual scheudling (manually assign a pod to a node) 

   Populating `pod.spec.nodeName` will by-pass the scheduler. If the node does not exist then the pod will be stuck on pending. It is still subject to node resource restraints, if it violates it will not schedule the pod - but it'll bypass any cordons.

### Scoring
Assigns priority weights to the eligible nodes (e.g. is container image already on the node, spreading pods across the nodes)


### Binding 
- highest priority node(s) are assigned the pod (updates pod object)


## Customer scheduler

You can implement your own scheduler and even have multiple schedulers running concurrently. In the pod spec you can specifier the scheduler you wish to use. A custom scheduler is packaged  as container image and deployed as system pod. 

See https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/


## Questions
 - What is node affinity vs pod affinity?
 - What is the topologyKey? does it relate to a label key of a node, and is used in the filtering?
 - What other types of topologyKey are there? How can we leverage AZs in AWS.
 - In cache and web server pod affinity example - how do we ensure that the pod talks to the cache on the same node/zone?
 - What type of taints are there? Why is the purpose of key vs effect?


## Todo
 - Taints
 - Node vs Pod affinity + examples
 - How does scoring work? Example of 'preferred' restraint had a weight, what does that value mean?
 - Can a container use more than is resource request?
# DaemonSet

A DaemonSet ensures all or some nodes run a particular pod. E.g kube-proxy runs on each node to provide network services. Other examples including log collectors, metric services and resource monitoring agents. Storage daemons might only be run on a subset of the nodes.

System pods (such as kube-proxy) will be scheduled on the master, but user-defined dameonsets will not be run on the master.

One pod will be schedule to each **worker** node in a cluster by the scheduler. As new nodes are added, the pod is added. We can also control *which* nodes get the pod using a NodeSelector. This is defined within the Pod 'spec' in the DaemonSet manifest. (Terraform lets us define node labels for our nodes.). The DaemonSet controller automatically createds/removes the  pod as such labels are added/removed from the node.


    k get daemonsets -n kube-system kube-proxy
    
    k get ds -n myapp -o wide
    
    k get pods -n myapp -o wide -l app=hello-world-ds
    
    k describe ds hello-world



## Updating strategy

RollingUpdate: By default DS controller will roll updates one at a time. Removing one pod, and then creating the new one. 
OnDelete: Pods are replaced as they are manually deleted


# Stateful set

Persistant naming?
Persistant volume?




Questions:
 - What is pod-template-generation used for?
 
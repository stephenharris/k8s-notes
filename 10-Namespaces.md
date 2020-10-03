# Namespaces

Namespaces are an organizational construct within the cluster, it's like a virtual cluster. It allows us, for instance, to provide different access policies per namespaces and provides a naming boundary. They also allow us to easily enforce traffic/security boundaries and isolate different parts of the cluster, and impose resource limitations on indivual parts of the cluster.

Resouces (pods, controllers, services) are namespaced. "Physical" things (PVs, Nodes) are not.

Default namespaces: include 'default', kube-public (commonly used to shared objects, e.g. ConfigMaps that are read by the entire cluster).and kube-system which contains the system pdos (etcd, scheduler, api-server etc)


    kubectl get namespaces
    kubectl describe namespaces
    kubectl describe namespaces <namespace>
    

    # list all resources that are namesped or not
    k api-resources --namespaced=true|false | more


    # Get all pods/services across namespaces
    kubectl get pods --all-namespaces
    kubectl get services --all-namespaces
 

    # Get pods/services in a namespace
    k get pods -n kube-system
    k get services -n kube-system
 
Namespaces should be lowercase, alpha-numeric. To create a namepsace:

    k apply -f myapp.namespace.yaml

Namespaces are specified for resources as metadata with key `namespace`. 


Questions:
 - How to impose access policies for different part of the nameservers?
 - How to impose resource restrictions on namespaces?
# Troubleshooting

## Monitoring

Some options:

 - Web UI Dashboard
 - Metrics Server (autoscaling)
 - kube-state-metrics
 - Prometheus
 - Grafana (dashboards)


## Metrix Server

Is a cluster-wide aggregator of resource usage data. It's typically deployed by default (?). 

    # Get the Metrics Server deployment manifest from github, the release version may change
    # https://github.com/kubernetes-sigs/metrics-server
    wget https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml

    #Add these two lines to metrics server's container args, around line 90
    # - --kubelet-insecure-tls
    # - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname

    #Deploy the manifest for the Metrics Server
    kubectl apply -f components.yaml


It shows CPU & memory usage of your nodes and pods.

    k top nodes
    k top pods

    # sort by cpu and show breakdown by containers
    k top pods --containers --sort-by=cpu

## Kube-state-metrics

Listens to Kubernetes API server and generates metrics about the objects in kubernetes. It not focussed on the individual K8S components
but rather healthy of various objects inside such as deployments, nodes and pods.(?)

## Prometheus

Monitoring and alerting toolkit. 



## Accessing container logs

To access a container's log

    k logs [pod-name]
    # or k logs [pod-name] -c [container_name] if pod contains multiple containers
    # or k logs [pod-name] --all-containers
    # to get logs for pods with a particular label
    k logs --selector key=value

To access the logs of a container that is no longer running (or if the container has been restarted):

    k logs -p [pod-name]


Note if kubectl is unavailable but you have ssh access to the node you could try:

    docker logs [container-name]

or 

    tail /var/log/containers/[container-name]_[container-id]


To stream logs

    k logs -f [pod-name]


## Kubelet logs

If you're in a systemd service based systems, you can access kubelet logs

    journalctl -u=kubelet.service
    journalctl -u=kubelet.service --no-pager --since today    

or you can

    tail /var/log/kubelet.log

## Kube-proxy logs

If it is running as pod you can access the logs as with any other logs. Otherwise it should be accessible at

    tail /var/log/kube-proxy


Also see /var/log/messages.


## Control plane logs

If running as pods you can acceess them the usual way. Otherwise they should be in journalctl. Lastly

    /var/log/kube-apiserver.log
    /var/log/kube-scheudler.log
    /var/log/kube-conroller-manager.log


## Kubectl events

Events in kubenernetes are logged for one hour. 

    # To get all events
    k get events
    k get events --sort-by='.metadata.creationTimestamp'
    k get events --field-selector type=Warning,reason=Failed

    # To watch
    k get events --watch
    
    # If its still runnings you can get events for a specific resource
    k describe [type] [name]



## Getting/describing a pod

    k get pod [pod-name] -o yaml
    k describe pod [pod-name]

## Execute in pod

    k exec [pod-name] -it sh




## Troubleshooting nodes

 - is it up? (ssh access to the nodes? check console?)
 - it  it reachable on the network? (firewalls?)
 - is systemd starting up docker and kubelet?
 - is kube-proxy pod running? (daemon set)
 

    # Get status of systemd unit
    sudo systemctl status kubelet.service

    
    # get logs of system.d unit
    sudo journalctl -u kubelet.service



# Troubelshooting control plane

When kubelet starts up it'll read the static pod manifest (typically /etc/kubenetes/manifests) and create the control plane pods (etcd, apiserver, controller manager and scheduler).
The location of the manifest files should be given as `staticPodPath` in the kubelet config (typically `/var/lib/kubelet/config.yaml`)

     k get componentstatuses


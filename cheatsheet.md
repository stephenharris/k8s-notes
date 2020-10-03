# Cheatsheet

Extracting data

    # list all pod names
    k get pods -o jsonpath='{ .items[*].metadata.name}{"\n"}' --sort-by=.metadata.name
    # kubectl get pods -l app=hello-world -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}'

    # get all container images in use by all pods in all namespaces
    k get pods --all-namspaces -o jsonpath='{ .items[*].spec.containers[*].image }'



Filtering

    # get all internal IP addresses of nodes in a cluster
    k get nodes -o jsonpath="{ .items[*].status.addresses[?(@.type=='InternalIP')].address }" 

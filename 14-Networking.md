# Networking

Kubernetes imposes the following fundamental requirements:

- All containers can communicate with each other on all nodes without NAT
- All nodes can communicate with all containers (and vice-versa) without NAT
- The IP address that a container sees itself as is the same IP address that others see it as


## How AWS achieves this

Each node (EC2) is assigned one or more elastic network interfaces, with each ENI having a primary IP and multiple secondary IP addresses. An elastic network interface is a virtual network interface that you can attach to an instance in a VPC. The primary IP is the IP of the interface itself, but the secondary IPs are free to be configured by the user (in this case Kubernetes). 


The AWS CNI plugin operates by attaching ENIs to EC2 instance in one of a collection of mutually routable subnets. Each pod on a node is assigned one of the secondary IPs attached to the ENI. Traffic for that IP is routed to the pod (see diagram). The CNI plug-in will handle attaching more ENI as required - and will try to ensure a 'warm pool' of IPs that it can use. (This can lead to subnet address exhaustion).

To see this in action:

Note the IP and node of a pod

   k get pod frontend-c894f7bb7-xnx2n -o jsonpath={.status.podIP}
   # 10.0.1.36

   k get pod frontend-c894f7bb7-xnx2n -o jsonpath={.spec.nodeName}
   # ip-10-0-1-138.us-east-2.compute.internal


First observe eth0 from within the pod has the IP of the pod and it matches a secondary IP of an attached ENI:

   k exec -it frontend-c894f7bb7-xnx2n ip addr show

Pod route table:

    $ kubectl exec -it frontend-c894f7bb7-xnx2n route
    
    Kernel IP routing table
    Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
    default         169.254.1.1     0.0.0.0         UG    0      0        0 eth0
    169.254.1.1     *               255.255.255.255 UH    0      0        0 eth0

Notice THAT 3 on the container maps to index 7 of host `eth0@if7` - we'll see  the reverse mapping later from inside the node.

    $ kubectl exec -it frontend-c894f7bb7-xnx2n ip link

    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    3: eth0@if7: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 9001 qdisc noqueue state UP 
        link/ether 96:df:36:10:48:3b brd ff:ff:ff:ff:ff:ff


To SSH into a node we can start a pod, install an ssh client and copy our key in:

    k run --generator=run-pod/v1 -it --rm aks-ssh --image=debian

    apt-get update && apt-get install openssh-client -y
    
    # new terminal
    kubectl cp ~/.ssh/k8s-test.pem aks-ssh:/id_rsa

    # back in pod
    chmod 0600 id_rsa
    ssh -i /id_rsa ec2-user@<node-private-ip>


On the node (10.0.1.138 in this example):

     $ route -n

     Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
     0.0.0.0         10.0.1.1        0.0.0.0         UG    0      0        0 eth0
     10.0.1.0        0.0.0.0         255.255.255.0   U     0      0        0 eth0
     10.0.1.36       0.0.0.0         255.255.255.255 UH    0      0        0 enife6ba1a7e11
     10.0.1.122      0.0.0.0         255.255.255.255 UH    0      0        0 eni111e53591ac
     169.254.169.254 0.0.0.0         255.255.255.255 UH    0      0        0 eth0

Now ip addr on the host shows that enife6ba1a7e11 maps to the network interface we saw form within the container (recall our container index 3 mapped to 7 - `eth0@if7`):

   $ ip addr
   
   ...
   7: enife6ba1a7e11@if3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc noqueue state UP group default 
       link/ether f2:36:9a:02:30:dc brd ff:ff:ff:ff:ff:ff link-netnsid 2
       inet6 fe80::f036:9aff:fe02:30dc/64 scope link 
          valid_lft forever preferred_lft forever
   ...

Note also the eth0 mac address is the mac address of the ENI in the AWS console.

As you can see traffic bound for 10.0.1.36 will use enife6ba1a7e11 interface. It has 'H' flag which indicates as an address on this host, and no gateway is used. Traffic for other pod on this node 10.0.1.144 (aks-ssh) is directed straight to those pod using their respective interfaces. All other traffic uses the default gateway, and exits via eth0. To see this we can use `traceroute`

    # traceroute from pod 10.0.1.144 to 10.0.1.36
    $ root@aks-ssh:/# traceroute -n 10.0.1.36

    traceroute to 10.0.1.36 (10.0.1.36), 30 hops max, 60 byte packets
     1  10.0.1.138  0.370 ms  0.316 ms  0.297 ms
     2  10.0.1.36  0.277 ms  0.245 ms  0.224 ms


    # trace route from pod 10.0.1.144 tp 10.0.2.64
    $ traceroute 10.0.2.64 

    traceroute to 10.0.2.64 (10.0.2.64), 30 hops max, 60 byte packets
     1  ip-10-0-1-138.us-east-2.compute.internal (10.0.1.138)  0.367 ms  0.311 ms  0.291 ms (<<<<< source node ip)
     2  ip-10-0-2-80.us-east-2.compute.internal (10.0.2.80)  1.017 ms  1.000 ms  1.050 ms (<<<<< target node ip)
     3  ip-10-0-2-64.us-east-2.compute.internal (10.0.2.64)  1.085 ms  1.088 ms  1.096 ms (<<<<<  target pod ip)



## K8s Network Topology

There are three network ip route show table eni-1

- Node network - e.g. VPC. Nodes will be assigned an IP
- Pod network - e.g. pods within the node assigned unique IP within the Pod CIDR range
- Cluster network - used by services, clusterIps, Load Balancers(?)


## Pod network(?)

Containers in a pod share a network network namespace. This means that all containers are addressed by the same IP, and they share port space. In practical terms it means that all the containers in a pod can reach each other on localhost


## Node Network(?)


For inter-pod communication on the same node, Pods will use their actual pod IP address. When a pod is created k8s will create a pause container first for creating the network namespace. The containers within that pod will be created within that network namespace. These means the application containers can be restarted independently of the network they live in. When the pod is destroyed, so to is the pause container.


For intra-node pod communication - Pods will communicate on their realy IP

Services are implemented on kube-proxy, providinga access to both internal and external clients


# Container Network Interface CNI

CNI defines a standard spc for managing container networkings. It's indepdent of the container runtime, meaning you can swap out Docker for something else. The CNI interacts with container runtime and host OS to set up networking for the containers (e.g. setting up namespaces, interfaces, bridges, tunnels, IP addresses).

CNI plugins will run as a daemonset on each node in your cluster.


# Certificate Authority

Self-signed by default, but can be used part of an external PKI.

Used to
 
 - Generate service certificates to encrypt API service (HTTPS)
 - For authentication of users and kubelets




# Kubeconfigs

Used to how to connect to your cluster:

 - Cluster location
 - Certificate information



# Further readings

https://www.weave.works/blog/introduction-to-kubernetes-pod-networking--part-1

https://medium.com/@savvythrough/aws-eks-subnet-ip-optimization-67b7ac83124e

https://aws.amazon.com/blogs/containers/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/







=================== Notes - containers, linux namespaces and PIDS ======================



Note container lists additonal pod containers:

[ec2-user@ip-10-0-1-138 ~]$ docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Image}}'
CONTAINER ID        NAMES                                                                                            IMAGE
42be4c68f459        k8s_aks-ssh_aks-ssh_default_fcf38abb-557a-441a-b44a-7b98f66f30f1_0                               debian
835b8d4a8292        k8s_POD_aks-ssh_default_fcf38abb-557a-441a-b44a-7b98f66f30f1_0                                   602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/pause-amd64:3.1

ead47571c45a        k8s_my-nginx-container_frontend-c894f7bb7-xnx2n_default_34ea54fb-1e63-47b0-b72d-71b02008a638_0   7d0cdcc60a96
789e1cdcaefa        k8s_my-other-container_frontend-c894f7bb7-xnx2n_default_34ea54fb-1e63-47b0-b72d-71b02008a638_0   karlherler/pause
d279d5b22c1c        k8s_POD_frontend-c894f7bb7-xnx2n_default_34ea54fb-1e63-47b0-b72d-71b02008a638_0                  602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/pause-amd64:3.1

bd2bfb468b67        k8s_coredns_coredns-bd44f767b-h6zp5_kube-system_13e98f28-a8c1-43b7-9755-2f3397d2ee77_0           602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/coredns
66213e8ba24c        k8s_POD_coredns-bd44f767b-h6zp5_kube-system_13e98f28-a8c1-43b7-9755-2f3397d2ee77_0               602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/pause-amd64:3.1

5a7da4091689        k8s_aws-node_aws-node-2nhjh_kube-system_0f1c9f40-b354-4a86-a46b-58d86141bcd8_0                   602401143452.dkr.ecr.us-east-2.amazonaws.com/amazon-k8s-cni
27f673168588        k8s_POD_aws-node-2nhjh_kube-system_0f1c9f40-b354-4a86-a46b-58d86141bcd8_0                        602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/pause-amd64:3.1

9ecd10cc1536        k8s_kube-proxy_kube-proxy-jp4jf_kube-system_ff4c5bc5-3833-4c56-bd87-addce04f2b91_0               602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/kube-proxy
ad26ffd8b418        k8s_POD_kube-proxy-jp4jf_kube-system_ff4c5bc5-3833-4c56-bd87-addce04f2b91_0                      602401143452.dkr.ecr.us-east-2.amazonaws.com/eks/pause-amd64:3.1

So we have:
2 containers (pause "POD" container aks container) for our aks-ssh pod
3 containers (pause "POD", nginx and other) for our frontend application
2 containers (pause "POD" + coredns) for coredns
2 containers (pause "POD" + kube-proxy) for kube-proxy
2 containers (puase POD + aws-node) for aws-node


Let see all networks for our containres:

   for container in `docker container ls --format "{{.Names}}"`; do
     network=`docker inspect $container --format="{{ .HostConfig.NetworkMode }}"`
     image=`docker inspect $container --format="{{ .Config.Image }}"`
     printf '%-20s %-35s %-15s\n' $container $image $network
   done

k8s_aks-ssh_aks-... debian@sha256:46d659005... container:835b8d4a82922e9d3868813bb72c070e972ef41c773fca507a657cfc5fa864d7
k8s_POD_aks-ssh_... 602401143452.dkr.ecr.us... none           

k8s_my-nginx-con... sha256:7d0cdcc60a96a512... container:d279d5b22c1c2aab8f1a0d08a4697a965a2220509d4e3f2451629748f551e605
k8s_my-other-con... karlherler/pause@sha256... container:d279d5b22c1c2aab8f1a0d08a4697a965a2220509d4e3f2451629748f551e605
k8s_POD_frontend... 602401143452.dkr.ecr.us... none           

k8s_coredns_core... 602401143452.dkr.ecr.us... container:66213e8ba24cc91e71e9d26608520f10aef80e254adfdc9d79ee609990b779d9
k8s_POD_coredns-... 602401143452.dkr.ecr.us-... none

k8s_aws-node_aws... 602401143452.dkr.ecr.us-...container:27f67316858847451177e54905009780bc9c303909aa2bea5a3988bd6e19255f
k8s_POD_aws-node... 602401143452.dkr.ecr.us-... host           


k8s_kube-proxy_k... 602401143452.dkr.ecr.us-... container:ad26ffd8b418a450121cd9a00d0158bf7a79a01a84c415a0a87aea8f39e13a6a
k8s_POD_kube-pro... 602401143452.dkr.ecr.us-... host           


[ec2-user@ip-10-0-1-138 ~]$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
a48080aac555        host                host                local
2211f96de9fc        none                null                local

docker network inspect a48080aac555
 - contains containers aws-node, kube-proxy, 

docker network inspect 2211f96de9fc
 - contains pause containers for coredns, aks-ssh, frontend, 



# Volumes

Volumes are one way of persisting data beyond the lifecycle of a pod (though some types are tied to the pod/node's lifecycle). E.g. you might run a database in a pod, but the data is persisted to a volume so if that pod goes down, you do not loose any data.

Using volumes involve the following API objects:

 - **PersistantVolumes** -  these represent the physical underlying media. They'll contain the specifics for communicating with it. They are pod-independent storage, defined at cluster level. Examples include (NFS, AzureFIle, FibreCHannel, awsElasticBlockStore)
 - **PersistantVolumeClaim** -  these represent a request from for access to a persistant volume (size, access modes, read-only/read-write). Pods request access to the PV through a PVC, essentially requesting the storage from the cluster: decoupling the pod from the underlying physical media.
 - **VolumeMount** - This is where the Pod references the PVC and where it should be mounted to within its containers. A single pod can have multiple volumes attached  to it.
 


## Access modes

Controls how node(s) access a PV. PVs map to the node by the kubelet and then exposed to the pod.

- **RWO** - One node can mount a volume for read-wirte access
- **RWX** - Multiple nodes can mount a volume for read-write access
- **ROX** - Multiple nodes can mount a volume for read-only access

These relates to node-level access not pod-level access. Multiple pods could still access the same PV at the same time (through the same PVC).


## Static Provisioning

 - Define a PV (connecting to physical media)
 - Create a PVC request
 - Define volume and mounts in Pod spec

## Dynamic Provisioning 

A **storageClass** allows you to define properties of a storage, specific to the storage provider (e.g. AWS/Azure/Google). The PVC will point to the storage class instead of the PV. In our Pod spec we will reference the PVC and mount the resulting volume into the container. When the Pod is created, the PV is dynamically created.

The parameters in a storageClass will be very specific to your storage provider.

By default the ReclaimPolicy is Delete. So if the PVC is deleted, the underyling PV and storage (along with any data) will be deleted.


## Storage lifecycle

 - **Binding** - matches PVC to PV. If it can't find a PV, the Pod with that PVC will remaining pending. Once bound its a 1-1 mapping
 - **Using** - Bound PVC is being used by a Pod a volume
 - **Reclaim** - When a PVC is deleted (not Pod!). There are two options here: Delete (delete the underlying storage) or Retain

A volume references a storage location and itself must have a unique name. A volume mount references a volume by name and defines a mountPath.

## VolumeType

 - **emptyDir** - Creates a directory on the pod. This is for transient data as it dies with the pod. Useful for sharing data between containers on the pod.
 - **hostPath** - Mounts onto the node filesystem. Tied to lifecyle of the node. Allows sharing data between pods on that node. 
 - **nfs** - A NFS share mounted into the pod.
 - **configMap/secret** - special types of volumes that provide a pod with access to kubernetes resource.
 - **persistentVolumeClaim** - provides pods with a more persistent storage option
 - **cloud** - cluster-wide storage
 - **awsElasticBlockStore** 


### emptyDir

A volume is defined as part of the spec of the pod, specifying a unique name and that its an empty path. Each container in the
pod that whats to access the volume can then declare a volumeMount, specifying the name of the mount and a path within the
container that it should be mounted to.

See

   k apply -f emptydir.pod.yml


### hostPath

Allows pods within that node to talk to a particular location on the node. E.g. pods on other nodes will not be able to access
the volume!


## PersistentVolume (PV)

A cluster-wide storage unit, independent of the lifecycle of a pod. This is a resource which abstracts away from the pods in
the container the actual persistant storage impelementation. The PV will relies on some form of network-attached storage (e.g.
EFS? S3?) to actually store the data.

A PV is not tied to a specific pod or node. 

A PersistentVolumeClaim (PVC) is used to associate a Pod with a PV.




## StorageClass (SC)

A type of storage template to dynamically provision storage.

SC can be used to different "classes" of storage.

A pod can requests storage of a particular class. K8s will then automtically provision a PersistantVolume and bind it
to the Pod's PersistantVolumeClaim(?)

Steps:

 1. Declare a SC
 2. Declare a PVC referencing the SC (rather than a PV)
 3. K8S creates the PV dynamically, and attaches the PV to the PVC



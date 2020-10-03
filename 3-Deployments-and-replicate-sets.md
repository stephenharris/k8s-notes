# Deployments & Replica sets

A *ReplicaSet* is a declarative way to manage pods (e.g. maintain X pods). A *Deployment* is declarative way to manage Pods using a ReplicaSet (i.e. it's a wrapper for ReplicaSets).

If a pod is destroyed, ReplicaSets and Deployments ensure a new one is created, and can be used to scale pods.

So a ReplicaSet's responsibilities:

 - Provide self-healing mechanism 
 - Ensure desired state is met (e.g. have X pods)
 - Provide fault tolerance
 - Scale pods

Deployments are a higher-level wrapper:

 - Manages ReplicateSets
 - Scales ReplicateSets
 - Supports zero-downtime upadtes by creating
   and destroying ReplicaSets
 - Provides rollback functionality
 
Deployments create a unique label that is assigned to the ReplicaSet and generated Pods

Creating a deployment
  
   # The record will store this deployment in the history
   kubectl apply -f frontend.deployment.yml --record

   # checking status
   k rollout status deployment [deployment-name]

Lising deployments:

    kubectl get deployments --show-labels

Get all deployments with a specific label

    kubectl get deployments -l app=nginx

Describing a deployment

    k describe deployment nginx

Deleting a deployment

   kubectl delete -f frontend.deployment.yml

Scaling deployments

   kubectl scale deployment [deployment-name] --replicas=5
   kubectl scale -f frontend.deployment.yml --replicas=5


Deployments allow you to deploy changes with zero-downtime. There are several options available:

 - Rolling updates
 - Blue-green deployments
 - Canary deployments

It also supports rollbacks.


### Rolling updates

Rolls out new pods one-by-one, while removing existing pods. Services will route traffic to the new pods as they become available.
It appears that kubernetes may delete an existing pod before creating a new one, or may create a new one before deleting an existing pod,
you can specify limits to control this in `.spec.strategy.rollingUpdate.maxUnavailable` and `.spec.strategy.rollingUpdate.maxSurge`.


### Canary Deployments

We rollout a new deployment but only route some traffic to it alongside the existing production version, and then monitor how it compares
against the existing baseline.

A service is used to balance traffic across the existing stable version and the canary version, using labels to isolate the canary.

This typically works by:

 - Creating a new 'canary' deployment alongside the stable, with relatively fewer replicas and the new image
 - The canary deployment shares the labels targeted by the service (e.g. load balancer) (typically it'll have a 'canary' label and the 
   existing instances a 'stable' label)
 - Once verified that its working you can either scale up the canary deployment and scale down the stable OR update the image in the stable
   and remove the canary.


### Blue-Green

In this deployment we have two identical (in infrastructure) environments ("green" and "blue"). While one side is serving production traffic, the otherside is idle - or might be serving testers only.

Traffic is switched from one colour to the next when checks pass.


## History & Rollbacks

When doing a `create` or `apply` you need to use the `--record` command
to save the deployment to history.

    # Get a list of deployments
    k rollout history deployment [deployment-name]

    # Get a particular revision
    k rollout history deployment [deployment-name] --revision=2

Viewing a diff (custom plug-in, see `kubectl-revision-diff`)

    k revision diff --old=<old-revision> --new=<new-revision>
 
Rolling back:

    k rollout undo -f file.deployment.yml

    k rollout undo deployment [deployment-name] --to-revision=2


## Quarantining a pod

- We can "qurantine" a pod by changing its labels, do its no longer in the service pool (i.e. doesn't match selector of the service). We can use `kubectl label` to change the labels of a pod:

    # Adds unhealthy=true label and removes the tier label if its present
    kubectl label pod frontend-6c7f8c65f9-mtch4 unhealthy=true tier-

    # or we can overwrite an exiting label
    kubectl label pod frontend-6c7f8c65f9-mtch4 tier=qurantine --overwrite


## Match Expressions

Match expressions is a selector which allows you to use operators such as In NotIn, Exists and DoesNotExist on label keys and values, to provide a more complex selector.

    selector:
      matchExpression:
        - key: app
          operator: In
          values:
            - foo
            - bar


## Pausing deployments

When paused, changes to Deployment are not rolled out. The current state is maintained until the deployment is resumed. Once resumed, a new ReplicaSet with the new changes is rolled out.

    kubectl rollout pause deployment <name>

    kubectl rollout resume deployment <name>


## Autmoatically scalling deployments

Horizontal pod autoscaler - k8s resources scales a number of pods in a RS/D based on resource utilisation, and is driven by controller manager.
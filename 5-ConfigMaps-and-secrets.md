# Config Maps & Secrets

## ConfigMaps

ConfigMaps provide a way to store configs and expose it to containers across the cluster. It, along with Secrets, allow us to build immutable container images, which allows us to re-use those images between envrionments or even organisations without exposing sensitve or configuration data.

You can store data in ConfigMaps

 - from a file: key is the filename, value is the contents (json, xml, yaml)
 - provide on the command line 
 - ConfigMap manifest (yaml file), defining key-value pairs


ConfigMaps can be accesse by a pod using:

 - Environment variables (key/value)
 - ConfigMap volume (access a files)


As with all resources, ConfigMaps & Secrets are only accessible by pods in the same namespace. If a pod can't access it a ConfigMap / Secret it will fail to start up.

### Create a ConfigMap

We can create a config map using a manifest:

    k apply -f app-settings.configMap.yaml

Or we can create one using command line:

    k create configmap json-settings --from-file=settings.json

Inside the pod, the key will be "settings.json" and the value will be the file contents which
in this case can be parsed as a json files.

Or we can use a `.env` file to store key-value pairs and then import them into our cluster

    k create configmap env-setting --from-env-file=settings.env

Lastly we can define specific key-value pairs

    k create configmap inline-setting --from-literal=apiUrl=https://myapi --from-literal=otherKey=otherValue


### Viewing a config map

    # List config maps
    k get cm
  
    # Get a particular config
    k get cm [config-name] -o yaml


### Access config values in pods

#### Environment variables

We can declare values from configMaps as environment variables inside containers.
As follows:

  env:
  - name: NUM_ENEMIES # The environment var referencing the value in our container
    valueFrom: 
      configMapKeyRef: 
        name: app-settings # name of configMap
        key: enemies # name of key in configMap


Or we can load all keys from a configMap as environment variables

  envFrom:
    - configMapRef:
      name: app-settings


**Note:** Envrionment variables are defined at container start-up and are not updated during the pod's lifecycle. I.e. a change to the configMap won't propogate to environment varables of pods: we would need to redeploy the pods. 

#### Volume

ConfigMaps can be loaded through a volume. Each key is converted into a file, and the value is stored as the content of
that file. The file is then mounted on the pod.

E.g.


  apiVersion: apps/v1
  ...
  spec:
    template:
     ...
    spec:
      volumes:
        - name: json-settings-vol
          configMap:
            name: json-settings
      containers:
        volumeMounts:
          - name: json-settings-vol
            mountPath: /etc/config


Then `/etc/config/settings.json` will contain the content of our JSON settings file. Note this is because the single *key* in
our json-settings configMap was `settings.json` and the value was the JSON file content (as this was loaded from a file).

If we instead used `app-settings`, we would get 4 four files.

Unlike environment variables, if the configMap is updated then the files are automatically updated/replaced. This is an *eventually consistent* system: there may be some delay for the new values to propogate.

However, if the configMap is supply a configuration file for a process (e.g. nginx) that needs to be reloaded before the change in configuration takes effect then this automatic update might not be helpful. Additionally it is generally safer to treat config maps as immutable and use deployments to roll out new pods using the new configuration. This allows you to take advantage of rollouts, readiness probes and rollbacks - as well avoiding the problem of getting applications to recognise config changes.
      
### Worked example

Create configs using a convig map:

    k apply -f app-settings.configMap.yaml

Create configs using json file

    k create configmap json-settings --from-file=settings.json

Create configs using env file 

    k create configmap env-setting --from-env-file=settings.env

Next create docker image

    docker build -t simpleapp .

Build our app:
   
    k apply -f configured-nginx.pod.yml

Port forward

    k port-forward configured-nginx 8080:9000


## Secrets

Secrets are an object that contains a small amount of sensitive data (password, keys, certfificates). 
We can securely store this data in a secret rather than baking it into the image, or including them 
in deployment manifest.

Like ConfigMaps, Secrets can be inserted into pods as files or environment variables.

K8s will only expose Secrets to nodes which contain pods which require it. Additionally secrets are
stored on tmpfs, not to disk.

By default, however, passwords are not encrypted only base64 encoded.


### Types of secret

 - Generic: key/value pair
 - TLS
 - Docker registry

### Creating a secret

    # Create from key-value pair
    k create secret generic my-password --from-literal=pwd=my-password

    # Create from file
    k create secret generic my-keys --from-file=ssh-privatekey=~/.ssh/id_rsa
 
    # Create TLS secret (?)
    k create secret tls tls-secret --cert=/path/to/tls.cert --key=/path/to/tls.key

You can create a secret using a manifest file, but it'll only base64 encoded in the manifest file.

### Listing secrets

     k get secrets

     k get secrets my-password -o yaml


### Accessing config values in pods

#### Environment variables

We can declare values from configMaps as environment variables inside containers.
As follows:

  env:
  - name: PWD # The environment var referencing the value in our container
    valueFrom: 
      secretKeyRef: 
        key: pwd # name of configMap
        name: my-password # name of key in configMap


Or we can load all keys from a configMap as environment variables

  envFrom:
    - secretKeyRef:
      name: app-settings



### Volume

ConfigMaps can be loaded through a volume. Each key is converted into a file, and the value is stored as the content of
that file. The file is then mounted on the pod.

E.g.


  apiVersion: apps/v1
  ...
  spec:
    template:
     ...
    spec:
      volumes:
        - name: private-key-vol
          secret:
            # Note it is secretName unlike simply 'name' for config
            secretName: my-key
      containers:
        volumeMounts:
          - name: private-key-vol
            mountPath: /etc/password



## Accessing a Private Container Registry

Create a secret of type `docker-registry`, and then expose that in the pod spec. 



  apiVersion: apps/v1
  ...
  spec:
    template:
     ...
    spec:
      volumes:
        - name: private-key-vol
          secret:
            # Note it is secretName unlike simply 'name' for config
            secretName: my-key
      containers:
        imagePullSecrets:
          - name: my-private-reg-secret

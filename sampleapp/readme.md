# Simple Node App

Displays pod name, app version and config/secrets.

## Build

    docker build -t simpleapp:v1 --build-arg VERSION=v1

If using minikube you'll need to use the minikube deamon to make the image available to k8s to pull down:

    eval $(minikube docker-env)
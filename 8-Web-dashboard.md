
## Create the dashboard nodes

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml

    # Create admin user
    k apply -f dashboard-adminuser.yaml
   

## Get service token

    k -n kubernetes-dashboard describe secret $(k -n kubernetes-dashboard get secret | grep "admin-user-token" | awk '{print $1}')



## Create proxy to access dashboard
kubectl proxy

## Go to dashboard
Go to http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ and enter in the token 

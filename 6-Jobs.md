# Jobs

A job creates one or more pods and ensures a specified number of them successful terminate. They do not run indefinitely. A job can be configured to run multiple pods in parallel. The Job controller willl track the number of successful completions and finish once the desired number of completions have been completed. 

Jobs are intended for one-off job execution. A job is immutable, so you cannot change the pod's container images or commands, or the job's number of completions. Instead you delete the job, and create a new one.

"Success" is based on a zero exit code.

If the pod's execution is interupted (e.g. node failure), then the Job controller will reschedule the pod. If the container in the pod returns a non-zero exit code we need to tell the pod the `restartPolicy`. By default, this will be 'Always', but jobs are appropriate only for pods with restartPolicy equal to OnFailure (pod restarts the container when there is a non-zero exit code from the container) or Never (container is not restarted, and the Job is marked as failed). We cannot use 'Always' as when the container completes, it will just be restarted again.

When a Job completes it status is marked to "Complete". The job object remains, and the pods are not deleted (so we can inspect logs / other output). Once a Job is deleted by a user its Pods are removed.

If a Job's pod errors it can retry with a new pod. It repeats this until the `job.spec.backoffLimit` is reached (default is 6); the job is then marked as failded.
 
Jobs could be:
 - back-ups
 - moving data
 - dead-letter queue
 - retrieve and cache remote data

## Cron Jobs

**CronJobs** creates Jobs on time-based schedule, so it effectively a Job that runs on a scheduled basis. Scheduling is used the Cron format (`cronjob.spec.schedule`). However, unlike a Job, pods created will be periodically 'cleaned up' based on the `cronjob.spec.successfulJobsHistoryLimit` and `cronjob.spec.failedJobsHistoryLimit` 

**Note:** CronJob names must be less than 52 characters.


## Creating Jobs / Cron Jobs
To run a job (or cron job)

    k apply -f pie.job.yml

You can also set a maximum number of 'retries' to start a job before it fails (e.g. node unavailable).

You can get/descirbe jobs as follows:

    k get jobs

    k get job [job-name] -o yaml

    k describe job [job-name]

To get/describe cron jobs

    k get cronjobs

    k get cronjobs [cron-job-name] -o yaml

    k describe job [cron-job-name]


# ☸️ SchemaShift on Kubernetes

This directory contains the production-grade Kubernetes manifests and architecture for deploying **SchemaShift** and running **isolated sandbox tests inside ephemeral Kubernetes Pods**.

---

## 🎯 Why Use Kubernetes for SchemaShift?

In local development, SchemaShift provisions containers using `dockerode` through `/var/run/docker.sock`. However, in enterprise and cloud environments (EKS, GKE, AKS, OpenShift):

1. **Security Compliance**: Exposing `/var/run/docker.sock` grants root-level host daemon access, which is strictly prohibited in hardened clusters.
2. **Container Runtime Independence**: Modern Kubernetes uses `containerd` or `CRI-O`, not Docker.
3. **Hard Network Isolation**: Kubernetes `NetworkPolicy` allows completely cutting off egress for sandbox pods, preventing untrusted user SQL from reaching cloud metadata services (`169.254.169.254`) or internal VPC endpoints.
4. **Automatic Garbage Collection**: `activeDeadlineSeconds: 35` guarantees that runaway or stuck pods are killed by the kubelet automatically without orphaned container leaks.

---

## 📁 Manifest Structure

| File | Purpose |
| :--- | :--- |
| `namespace.yaml` | Creates `schemashift` (app) and `schemashift-sandboxes` (isolated execution namespace with Restricted Pod Security Standard) |
| `rbac.yaml` | ServiceAccount & RoleBinding giving the backend least-privilege rights to spawn and terminate pods **only** in `schemashift-sandboxes` |
| `network-policy.yaml` | Denies all egress from sandbox pods (zero-trust network boundary) |
| `backend-deployment.yaml` | Express backend deployment (2 replicas) with health checks & ClusterIP service |
| `frontend-deployment.yaml` | Next.js frontend deployment with Service and Ingress routing |

---

## 🚀 Quick Deployment Guide

### 1. Apply Namespaces & RBAC Security
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/network-policy.yaml
```

### 2. Deploy Backend & Frontend
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### 3. Verify Deployment
```bash
kubectl get pods -n schemashift
kubectl get svc -n schemashift
```

### 4. Port-Forward for Local Testing (Minikube / Kind)
```bash
# Access Frontend
kubectl port-forward svc/schemashift-frontend-svc 3000:3000 -n schemashift

# Access Backend
kubectl port-forward svc/schemashift-backend-svc 8000:8000 -n schemashift
```

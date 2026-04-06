# Lab 9: Platform as a Service (PaaS)
## Deploy an Application on Google App Engine

---

## 1. Objective

To understand the **Platform as a Service (PaaS)** cloud computing model by developing and deploying a web application on **Google App Engine (GAE)**.

---

## 2. Theory: What is PaaS?

### 2.1 Definition

**Platform as a Service (PaaS)** is a cloud computing model that provides a complete development and deployment environment in the cloud. It abstracts away infrastructure management — servers, storage, networking, and operating systems — allowing developers to focus entirely on writing code and building applications.

### 2.2 Cloud Service Models Comparison

| Feature | IaaS | PaaS | SaaS |
|---|---|---|---|
| **What you manage** | Applications, data, runtime, middleware, OS | Applications & data only | Nothing (use the app) |
| **What provider manages** | Virtualization, servers, storage, networking | Runtime, middleware, OS, servers, storage | Everything |
| **Example** | AWS EC2, Google Compute Engine | Google App Engine, AWS Elastic Beanstalk | Gmail, Salesforce, Dropbox |
| **Target user** | System admins, DevOps | Developers | End users |
| **Flexibility** | High | Medium | Low |
| **Management overhead** | High | Low | None |

### 2.3 Key Characteristics of PaaS

1. **Infrastructure Abstraction** — No need to manage servers, OS, or networking
2. **Built-in Development Tools** — Runtime environments, middleware, and APIs included
3. **Automatic Scaling** — Platform scales resources up/down based on traffic
4. **Managed Services** — Integrated databases, authentication, logging, monitoring
5. **Pay-per-Use Pricing** — Pay only for consumed resources
6. **Rapid Deployment** — Deploy with simple CLI commands (`gcloud app deploy`)
7. **Built-in Load Balancing** — Traffic distributed automatically across instances
8. **Version Management** — Easy rollback to previous application versions

### 2.4 PaaS Providers

| Provider | PaaS Service | Key Features |
|---|---|---|
| Google Cloud | **App Engine** | Fully managed, auto-scaling, multiple runtimes |
| AWS | **Elastic Beanstalk** | Easy deployment, full AWS integration |
| Microsoft Azure | **App Service** | .NET-first, hybrid support |
| Heroku | **Heroku Platform** | Git-based deployment, add-ons marketplace |
| Render | **Render** | Free tier, auto-deploy from Git |

---

## 3. Google App Engine (GAE) Overview

### 3.1 What is Google App Engine?

Google App Engine is a **fully managed, serverless PaaS** platform for building and hosting web applications at Google-managed data centers. It was one of the first PaaS offerings (launched in 2008).

### 3.2 GAE Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Google App Engine                        │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Instance 1│  │Instance 2│  │Instance N│  ← Auto-scaled  │
│  │ (Node.js)│  │ (Node.js)│  │ (Node.js)│                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│       └──────────────┼──────────────┘                      │
│                      │                                     │
│              ┌───────┴───────┐                             │
│              │ Load Balancer │  ← Automatic                │
│              └───────┬───────┘                             │
│                      │                                     │
│              ┌───────┴───────┐                             │
│              │   Front-End   │  ← HTTPS Routing            │
│              │   Servers     │                              │
│              └───────────────┘                             │
└────────────────────────────────────────────────────────────┘
                       │
                       ▼
              https://PROJECT.appspot.com
```

### 3.3 GAE Environments

| Feature | Standard Environment | Flexible Environment |
|---|---|---|
| Startup time | Seconds | Minutes |
| Scaling | Rapid, scales to zero | Slower, minimum 1 instance |
| Runtime | Sandboxed, specific versions | Docker-based, any runtime |
| Cost | Free tier available | Always running = higher cost |
| Use case | Web apps, APIs | Custom runtimes, background work |

**Our deployment uses the Standard Environment** with the `F1` instance class (eligible for free tier).

---

## 4. Application: CloudNotes

### 4.1 Application Description

**CloudNotes** is a cloud-native task/note management web application built with:

- **Backend**: Node.js + Express.js (REST API)
- **Frontend**: Vanilla HTML/CSS/JavaScript (Single Page Application)
- **Storage**: In-memory (demonstrates PaaS — no database setup required)
- **Design**: Modern glassmorphism dark-mode UI

### 4.2 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check for GAE |
| `GET` | `/api/notes` | Retrieve all notes |
| `GET` | `/api/notes/:id` | Retrieve a single note |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/:id` | Update an existing note |
| `DELETE` | `/api/notes/:id` | Delete a note |

### 4.3 Project Structure

```
cloudnotes-paas/
├── server.js          # Express.js server with REST API
├── package.json       # Node.js project configuration
├── app.yaml           # Google App Engine configuration
├── .gcloudignore      # Files to exclude from deployment
├── README.md          # This documentation
└── public/
    ├── index.html     # Frontend SPA
    ├── style.css      # Design system (dark mode, glassmorphism)
    └── app.js         # Frontend JavaScript (API client)
```

---

## 5. Deployment Steps

### Step 1: Prerequisites

```bash
# Install Google Cloud CLI (macOS)
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Initialize Google Cloud

```bash
# Authenticate with Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create cloudnotes-lab9 --name="CloudNotes Lab 9"

# Set the active project
gcloud config set project cloudnotes-lab9

# Enable billing (required — use free trial credits)
# Visit: https://console.cloud.google.com/billing
```

### Step 3: Install Dependencies

```bash
# Navigate to project directory
cd "cc 9"

# Install Node.js dependencies
npm install
```

### Step 4: Test Locally

```bash
# Start the server
npm start

# Open in browser: http://localhost:8080
```

### Step 5: Create App Engine Application

```bash
# Create the App Engine app (first time only)
gcloud app create --region=us-central1
```

### Step 6: Deploy to App Engine

```bash
# Deploy the application
gcloud app deploy

# This will:
# 1. Package your application
# 2. Upload to Google Cloud
# 3. Build the container
# 4. Deploy to App Engine
# 5. Route traffic to the new version
```

### Step 7: Access the Deployed App

```bash
# Open the deployed app in your browser
gcloud app browse

# The URL will be: https://PROJECT_ID.appspot.com
```

### Step 8: Monitor Logs

```bash
# Stream live logs
gcloud app logs tail -s default

# View in Cloud Console: https://console.cloud.google.com/logs
```

---

## 6. Key Configuration: `app.yaml`

```yaml
runtime: nodejs22        # Node.js 22 runtime
instance_class: F1       # Smallest instance (free tier eligible)
env: standard            # Standard environment (scales to zero)

automatic_scaling:
  min_instances: 0       # Scale to zero when no traffic
  max_instances: 2       # Cap at 2 instances
  target_cpu_utilization: 0.65  # Scale up at 65% CPU
```

This configuration demonstrates PaaS auto-scaling:
- **No traffic** → 0 instances running (zero cost)
- **Light traffic** → 1 instance auto-provisioned
- **Heavy traffic** → Up to 2 instances with load balancing

---

## 7. PaaS Features Demonstrated

| PaaS Feature | How CloudNotes Uses It |
|---|---|
| **Zero server management** | We only wrote application code — no server provisioning |
| **Auto-scaling** | `app.yaml` configures 0–2 instances based on traffic |
| **Load balancing** | GAE automatically distributes requests across instances |
| **HTTPS by default** | All traffic is encrypted without manual SSL certificate setup |
| **One-command deployment** | `gcloud app deploy` packages, uploads, builds, and deploys |
| **Version management** | Each deployment creates a new version; rollback is one command |
| **Health monitoring** | `/health` endpoint monitored by GAE for instance health |
| **Managed runtime** | Node.js 22 runtime maintained and patched by Google |

---

## 8. Observations

1. **Simplicity**: Deploying to GAE required only adding `app.yaml` — no Docker, no server config, no networking setup.

2. **Developer Focus**: The entire development effort went into application logic and UI. Zero time was spent on infrastructure.

3. **Automatic HTTPS**: GAE provides SSL/TLS certificates automatically — a feature that would require manual setup on IaaS.

4. **Cold Starts**: With `min_instances: 0`, the first request after idle time may take a few seconds (cold start). Subsequent requests are fast.

5. **Cost Efficiency**: The F1 instance class with scale-to-zero means we only pay when the app is actively serving traffic.

6. **Trade-offs**: PaaS offers less control than IaaS — we cannot customize the OS, install system-level packages, or change the networking layer. In exchange, we get zero operational overhead.

---

## 9. Conclusion

This lab demonstrated the **Platform as a Service (PaaS)** model by deploying a Node.js web application to **Google App Engine**. Key takeaways:

- **PaaS eliminates infrastructure management**, letting developers focus purely on code
- **Google App Engine** provides automatic scaling, load balancing, HTTPS, and version management out of the box
- **Deployment is simple**: a single `gcloud app deploy` command handles the entire pipeline
- **The standard environment** can scale to zero, making it cost-effective for variable workloads
- **PaaS is ideal** for web applications, APIs, and microservices where operational simplicity is more important than infrastructure control

---

## 10. References

1. Google Cloud Documentation — App Engine: https://cloud.google.com/appengine/docs
2. NIST Definition of Cloud Computing: https://csrc.nist.gov/publications/detail/sp/800-145/final
3. Google App Engine Node.js Quickstart: https://cloud.google.com/appengine/docs/standard/nodejs
4. Express.js Documentation: https://expressjs.com/

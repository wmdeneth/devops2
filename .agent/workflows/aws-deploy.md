---
description: Deploy the application to AWS using Terraform
---

### Prerequisites
1. **AWS Account**: You need an active AWS account.
2. **AWS CLI**: [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and run `aws configure`.
3. **Terraform**: [Install Terraform](https://developer.hashicorp.com/terraform/downloads).
4. **SSH Key**: Ensure you have an SSH key at `~/.ssh/id_rsa.pub`. If not, generate one with `ssh-keygen`.

### Infrastructure Setup
1. **Navigate to Terraform Directory**:
   ```bash
   cd terraform
   ```
2. **Initialize Terraform**:
   ```bash
   terraform init
   ```
3. **Preview Changes**:
   ```bash
   terraform plan
   ```
4. **Apply Infrastructure**:
   ```bash
   terraform apply
   ```
   *Type `yes` when prompted.*

### Deploying the App
Once the infrastructure is ready, Terraform will output the `instance_ip`.
1. **Connect to Server**:
   ```bash
   ssh ubuntu@<instance_ip>
   ```
2. **Deploy the Application**:
   You can clone your repository and run the app:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   docker-compose up -d --build
   ```

### Cleanup
To destroy the infrastructure and avoid costs:
```bash
terraform destroy
```

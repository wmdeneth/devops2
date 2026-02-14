terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 1. Configure the AWS Provider
provider "aws" {
  region = "us-east-1"  # You can change this to your preferred region (e.g., ap-south-1)
}

# 2. Key Pair (Login Access)
# Use the public key from the workspace root directory
resource "aws_key_pair" "deployer" {
  key_name   = "devops-project-key"
  public_key = file("${path.module}/../ruhuna-key.pub")
}

# 3. Security Group (Firewall)
resource "aws_security_group" "app_sg" {
  name        = "devops_project_sg"
  description = "Allow SSH, HTTP, and App ports"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "React Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Node Backend"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. EC2 Instance (The Server)
resource "aws_instance" "project_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS (us-east-1). update if region changes!
  instance_type = "t2.micro"              # Free tier eligible

  key_name      = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "DevOps-Project-Instance"
  }

  # 5. User Data (Script to run on startup)
  # This installs Docker and Docker Compose so your app works immediately
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io docker-compose
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF
}

# 6. Output the IP address
output "instance_ip" {
  description = "The public IP of the application server"
  value       = aws_instance.project_server.public_ip
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_key_pair" "ruhuna_auth" {
  key_name   = "ruhuna-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDd6AMmLhoRkYHQrteU55b+l5x2N9MO+iGAdueCKQe4hb7V3y5Cls9p295C3th5qGlsZr2vom35f6qf+VFFTsdGE4CbqnkP/6X/akbLOtoDHk5zz4Q5wVqQFXDzNAuoDsqUtVm0XL5AtOl0kQqn3HecM5xsDsj9xrY8StXcs19+MW+4bLAZncUofrHx5FSHjECe5I1Ew2d9aI/XaffiZSdDN/G94g0HlFcQZm6j/9tvns80eK47XIidYyR8wR+DXnE1LAQK/XBM3zYZelGJZ7+L88ATcT3YbI7PrKhQbU1p3M/8YLZJOTlRz1EQxT6Duc3JOPPAugOcoKracBPOMekP"
}

resource "aws_security_group" "project_sg" {
  name        = "Ruhuna-SG"
  description = "Allow SSH and HTTP traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["45.121.88.169/32"] # My IP
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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

  tags = {
    Name = "Ruhuna-Security-Group"
  }
}

resource "aws_instance" "project_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS in us-east-1
  instance_type = "t3.micro"              # Stay in Free Tier!
  key_name      = aws_key_pair.ruhuna_auth.key_name
  vpc_security_group_ids = [aws_security_group.project_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              
              # Install Docker Compose
              sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              sudo chmod +x /usr/local/bin/docker-compose
              EOF

  tags = {
    Name = "Ruhuna-Inventory-Server"
  }
}

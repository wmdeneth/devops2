output "instance_public_ip" {
  description = "The public IP address of the EC2 instance"
  value       = aws_instance.project_server.public_ip
}

output "instance_ip" {
  description = "Raw EC2 instance public IP for deployment scripts"
  value       = aws_instance.project_server.public_ip
}

# main.tf - Placeholder for Terraform Configuration

# ------------------------------------------------------------------------------
# NO CLOUD RESOURCES ARE DEFINED IN THIS FILE BY DEFAULT.
# ------------------------------------------------------------------------------
#
# This Terraform directory is set up as a placeholder for potential future
# Infrastructure as Code (IaC) needs.
#
# Given the preference to avoid AWS costs:
# - Your Next.js application will primarily be deployed to Vercel.
# - Your database and file storage (for protocol documents) are handled by Supabase.
#
# These platforms (Vercel, Supabase) have their own management interfaces and
# free tiers, and are typically not managed via this AWS-centric Terraform setup.
#
# If, in the future, you decide to use specific AWS services (ideally within
# the AWS Free Tier to maintain no cost) or services from another cloud
# provider that Terraform supports, you would define those resources here.
#
# Running `terraform init` in this directory is safe.
# Running `terraform plan` will show no changes.
# Running `terraform apply` will do nothing unless resources are explicitly
# added to this file.
#
# Example (Commented Out - AWS S3 Bucket):
# If you were to use AWS S3 for general assets (and understood potential costs
# or Free Tier limits), you might uncomment and configure something like this:
/*
provider "aws" {
  region = "us-east-1" # Or your preferred region
}

variable "project_name" {
  description = "A name for the project, used to prefix resource names."
  type        = string
  default     = "medical-protocol-app-assets"
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
  default     = "dev"
}

resource "aws_s3_bucket" "application_assets" {
  bucket = "${var.project_name}-${var.environment}"
  tags = {
    Name        = "${var.project_name}-${var.environment}"
    Environment = var.environment
  }
}
*/
# ------------------------------------------------------------------------------
# End of file. Add your resource definitions above if needed.
# ------------------------------------------------------------------------------
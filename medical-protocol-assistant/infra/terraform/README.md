# Terraform Infrastructure for Medical Protocol Assistant

This directory is a **placeholder** for Terraform configurations to manage cloud infrastructure.

## Current Project Hosting Strategy (No AWS Costs by Default)

Your preference to **avoid AWS costs** has been noted. Therefore:

1.  **Next.js Application Hosting**: It is recommended to deploy your Next.js application to **Vercel**. Vercel offers excellent support for Next.js, CI/CD integration with GitHub, and a generous free tier. Vercel manages its own infrastructure.
2.  **Database & File Storage**: These are handled by **Supabase**, which also has a free tier. Supabase manages its own infrastructure.

**This Terraform setup is NOT currently used to provision or manage your primary application hosting on Vercel or your Supabase services.**

## Purpose of This Terraform Directory

This directory serves as a foundation if, in the future, you decide you need:

- Specific **supplementary** cloud services from AWS (ideally utilizing their [Free Tier](https://aws.amazon.com/free/) to maintain no costs).
- Services from other cloud providers that Terraform supports.

Examples of such supplementary services _might_ include:

- Advanced DNS management for a custom domain (e.g., using AWS Route 53).
- Specialized email sending services (e.g., AWS SES).
- This is **optional** and only if your needs expand beyond what Vercel and Supabase provide directly.

## Usage (If you decide to add resources here)

1.  **Install Terraform**:
    If you haven't already, [install the Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli).

2.  **Initialize Terraform (Safe to run):**
    Navigate to this `infra/terraform` directory in your terminal and run:

    ```bash
    terraform init
    ```

    This command is safe and only initializes Terraform for this directory (e.g., downloads provider plugins if you were to define them in `main.tf`). With the current `main.tf`, it will do very little.

3.  **Define Resources (Optional - Only if needed):**
    If you decide to manage specific cloud resources here:

    - You would first define a `provider` block in `main.tf` (e.g., for AWS).
    - Then, you would define the `resource` blocks for the services you want to create.
    - You might create a `variables.tf` for input variables and potentially a `terraform.tfvars` file (which should be gitignored if it contains secrets) to supply values.

4.  **Plan Changes (Safe to run):**
    To see what Terraform _would_ do based on your `main.tf`:

    ```bash
    terraform plan
    ```

    With the current empty `main.tf`, this will show "No changes."

5.  **Apply Changes (Use with CAUTION - Potential Costs):**
    **Only run `terraform apply` if you have intentionally defined resources in `main.tf` and understand any potential cost implications from the cloud provider.**

    ```bash
    terraform apply
    ```

    This command creates or modifies resources in your cloud account.

6.  **Destroy Resources (If created):**
    If you provisioned resources with `terraform apply` and want to remove them:
    ```bash
    terraform destroy
    ```

**Current `main.tf` Status:**
The `main.tf` file in this directory is intentionally kept minimal (containing only comments or a commented-out AWS provider and S3 bucket example) to ensure **no AWS resources are created and no costs are incurred by default.**

If you have no immediate plans to use Terraform for supplementary cloud services, you can safely leave this directory as is. It's here as a best-practice placeholder for Infrastructure as Code.

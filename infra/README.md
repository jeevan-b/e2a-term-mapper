# Phase 1 Infrastructure

Provision Phase 1 with infrastructure as code before enabling CD workflows.

Required resources:

- S3 bucket for web assets and `terms.json` snapshots.
- CloudFront distribution with HTTPS-only viewer policy.
- ECR repository for the API image.
- App Runner service for the API container.
- Secrets Manager entries for `JWT_SECRET` and future runtime secrets.
- GitHub OIDC role with least-privilege ECR, App Runner, S3, and CloudFront permissions.
- Route 53 records and ACM certificates for `termmapper.example.com` and optionally `api.termmapper.example.com`.

Do not commit secret values. Store environment-specific values in GitHub Actions variables and AWS Secrets Manager.

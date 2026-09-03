# Jeremiah Ruben — Portfolio Website

Personal portfolio website showcasing my projects, skills, and experience as a Software Systems Development graduate. Built with HTML, CSS, and JavaScript, and deployed on AWS using a serverless static-hosting architecture.

🌐 **Live site:** [www.jeremiahruben.my](https://www.jeremiahruben.my)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Hosting | AWS S3 (static hosting) |
| CDN + HTTPS | AWS CloudFront + AWS ACM (SSL certificate) |
| CI/CD | GitHub Actions (auto-deploy on push to `main`) |
| IAM | Scoped IAM user — S3 sync + CloudFront invalidation only |

---

## Project Structure

```
portfolio/
├── index.html              # Main HTML — all sections
├── styles/
│   └── main.css            # All styles, design tokens, responsive breakpoints
├── scripts/
│   └── main.js             # Theme, navbar, scroll reveal, modals, form, scroll-to-top
├── images/
│   ├── profile2.1.jpg      # Profile photo
│   ├── menu-qr-code.png    # QR code for the QR Menu System project
│   └── JeremiahRuben_Resume.pdf
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI/CD pipeline
```

---

## Deployment Architecture

```
GitHub (push to main)
        │
        ▼
GitHub Actions
  ├── aws s3 sync → S3 Bucket (jeremiahruben.my, ap-southeast-1)
  └── CloudFront invalidation (/* cache bust)
        │
        ▼
CloudFront Distribution
  ├── Origin: S3 via OAC (no public S3 access)
  ├── SSL: ACM certificate (us-east-1)
  └── Domain: www.jeremiahruben.my
```

**Key decisions:**
- S3 public access is **blocked** — CloudFront accesses the bucket via an Origin Access Control (OAC) policy
- ACM certificate provisioned in `us-east-1` (required for CloudFront regardless of bucket region)
- IAM user `github-actions-portfolio` has an inline policy scoped **only** to this S3 bucket and CloudFront distribution — no broad account access
- Bare domain (`jeremiahruben.my`) not in use because the Exabytes DNS panel lacks ALIAS/ANAME support; `www` subdomain routes correctly via CNAME

---

## CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow:

1. Syncs changed files to the S3 bucket (`aws s3 sync`)
2. Deletes files removed from the repo (`--delete` flag)
3. Creates a CloudFront invalidation on `/*` to bust the CDN cache

Credentials are stored as GitHub repository secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

---



---


## License
This project is open source. Feel free to use the structure and layout as inspiration for your own portfolio — just swap out the content for your own.
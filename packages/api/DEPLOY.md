# Deploying the API to AWS Lambda

First-time notes from deploying IronDog's API serverlessly (DynamoDB + Lambda + API
Gateway HTTP API behind `api.irondog.fit`). All commands assume the AWS CLI is
configured for your account under an explicit profile.

## Architecture

Managed by the CloudFormation stack `irondog-api` (`infra/api-stack.yml` at the repo root):

- **DynamoDB** — table `irondog-api`, `PAY_PER_REQUEST`
- **Lambda** — function `irondog-api`, `nodejs22.x`, 512MB, 15s timeout
- **API Gateway HTTP API** — `$default` stage, routes `ANY /` and `ANY /{proxy+}`, payload v2.0
- **Custom domain** — `api.irondog.fit`: ACM cert (DNS-validated) + Route53 alias record
- **CI role** — GitHub Actions OIDC role scoped to `repo:<org>/workout-tracker:*`

## One-time stack creation

Prerequisites:
- An existing Route53 hosted zone for `irondog.fit` (the provided `HostedZoneId`), with
  the domain delegated so the zone's NS records are active at the registrar.
- The web OAuth **Web application** client ID from Google Cloud Console.

Run from the repo root:

```bash
aws cloudformation deploy \
  --region us-west-2 \
  --template-file infra/api-stack.yml \
  --stack-name irondog-api \
  --profile=<aws-profile> \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    DomainName=api.irondog.fit \
    HostedZoneId=<hosted-zone-id> \
    JwtSecret=<jwt-secret> \
    GoogleWebClientId=<google-web-client-id> \
    GithubOrg=<github-owner> \
    GithubRepo=workout-tracker
```

Notes:
- `JwtSecret` and `GoogleWebClientId` are `NoEcho` parameters — AWS never returns them.
  Save them somewhere safe; a re-deploy of the stack needs them re-supplied.
- `CAPABILITY_NAMED_IAM` is just consent to create IAM roles. It creates nothing up front.
- Deploy takes ~2–5 min while the ACM certificate completes DNS validation (CFN creates
  and removes the validation CNAMEs and the `api.irondog.fit` alias record automatically —
  no manual Route53 records needed).

## CI role ARN → GitHub secret

```bash
aws cloudformation describe-stacks --region us-west-2 --stack-name irondog-api --profile=<aws-profile> \
  --query "Stacks[0].Outputs[?OutputKey=='GithubActionsRoleArn'].OutputValue" --output text
```

Set the returned full ARN as a **repository secret** `AWS_ROLE_ARN`
(Settings → Secrets and variables → Actions). `.github/workflows/deploy-api.yml` uses it
with GitHub OIDC to push the bundle and smoke-test `/health`.

## Updating the Lambda code

CI does this automatically on push to `main` (built with esbuild, zip =
`dist/index.js` only, since `@aws-sdk/*` is provided by the Lambda runtime). Manually:

```bash
npm run build --workspace=@irondog/api
npm run bundle --workspace=@irondog/api
cd packages/api/dist
zip ../../../api-lambda.zip index.js index.js.map
aws lambda update-function-code --region us-west-2 --function-name irondog-api \
  --zip-file fileb://api-lambda.zip --profile=<aws-profile>
```

## Verifying

```bash
curl -fsS https://api.irondog.fit/health
```
→ `{"status":"ok"}`

## Troubleshooting (learnings from first deploy)

- **`ApiMapping` failed with `Invalid domain name identifier ... 404`** — it referenced the
  `DomainName` *parameter string* (`api.irondog.fit`) instead of the `ApiDomain` resource,
  so CloudFormation created the mapping before the custom domain existed (no dependency).
  Fixed by using `DomainName: !Ref ApiDomain` (which also adds the dependency). If you touch
  the mapping again, keep any dependency on `ApiDomain`/`ApiGatewayStage`.
- **`Rollback requested by user`** — CloudFormation aborts the whole stack when any single
  resource fails; the message is CFN's standard wording, not a user action.
- **Stack stuck in `ROLLBACK_COMPLETE` cannot be redeployed** — delete it first:
  ```bash
  aws cloudformation delete-stack --region us-west-2 --stack-name irondog-api --profile=<aws-profile>
  ```
  then re-run the deploy command (fresh CREATE).
- **`Stack does not exist`** — usually the wrong region or profile, not a deleted stack.
  Always pass `--region us-west-2 --profile=<aws-profile>` together.
- **Invalid default-profile creds** (`InvalidClientTokenId`) — the default AWS profile was
  stale; use `--profile=<aws-profile>` explicitly on every command.

## Rotating `JwtSecret`

Re-run `deploy` (or `update-stack`) with a fresh `JwtSecret` parameter. Changing it invalidates
all issued tokens (everyone re-authenticates). Generate one with `openssl rand -hex 32`.

## Cost

Serverless: DynamoDB `PAY_PER_REQUEST` + Lambda 512MB + API Gateway. No idle cost; priced per
request. Budgeted around $1.50–2.50/month for a single user doing ~1h workouts daily.
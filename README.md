# GitHub Organization Authorization Report Action

> A GitHub Action to generate reports that contain all the SSH keys, personal access tokens, GitHub App installations, deploy keys and their respective permissions authorized against a GitHub organization.

## Usage

The example [workflow](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions) below runs on a weekly [schedule](https://docs.github.com/actions/reference/events-that-trigger-workflows#scheduled-events) and can also be executed manually using a [workflow_dispatch](https://docs.github.com/actions/reference/events-that-trigger-workflows#manual-events) event.

```yml
name: Organization Authorization Action

on:
  schedule:
    # Runs on every Sunday at 00:00 UTC
    #
    #        ┌────────────── minute
    #        │ ┌──────────── hour
    #        │ │ ┌────────── day (month)
    #        │ │ │ ┌──────── month
    #        │ │ │ │ ┌────── day (week)
    - cron: '0 0 * * 0'
  workflow_dispatch:

jobs:
  github-authorization-report:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Get authorization report
        uses: nicklegan/github-org-authorization-action@v2.0.0
        with:
          token: ${{ secrets.ORG_TOKEN }}
        # org: ''
        # app-sort: 'install_id'
        # app-sort-order: 'desc'
        # ssh-sort: 'credential_authorized_at'
        # ssh-sort-order: 'desc'
        # pat-sort: 'credential_authorized_at'
        # pat-sort-order: 'desc'
        # deploy-keys-sort: 'date'
        # deploy-keys-sort-order: 'desc'
        # json: 'false'
```

## GitHub secrets

| Name                 | Value                                              | Required |
| :------------------- | :------------------------------------------------- | :------- |
| `ORG_TOKEN`          | A `repo`, `read:org`scoped [Personal Access Token] | `true`   |
| `ACTIONS_STEP_DEBUG` | `true` [Enables diagnostic logging]                | `false`  |

[personal access token]: https://github.com/settings/tokens/new?scopes=repo,read:org&description=Authorization+Action 'Personal Access Token'
[enables diagnostic logging]: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging#enabling-runner-diagnostic-logging 'Enabling runner diagnostic logging'

:bulb: Disable [token expiration](https://github.blog/changelog/2021-07-26-expiration-options-for-personal-access-tokens/) to avoid failed workflow runs when running on a schedule.

:bulb: If the organization has SAML SSO enabled, make sure the personal access token is [authorized](https://docs.github.com/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on) to access the organization.

## Action inputs

| Name                     | Description                                                                        | Default                     | Location       | Required |
| :----------------------- | :--------------------------------------------------------------------------------- | :-------------------------- | :------------- | :------- |
| `org`                    | Organization different than workflow context                                       |                             | [workflow.yml] | `false`  |
| `app-sort`               | Sort the GitHub Apps CSV report by column (select column in JSON format)           | `install_id`                | [workflow.yml] | `false`  |
| `app-sort-order`         | Sort the selected CSV column of GitHub Apps in the specified order                 | `desc`                      | [workflow.yml] | `false`  |
| `ssh-sort`               | Sort the SSH key CSV report by column (select column in JSON format)               | `credential_authorized_at`  | [workflow.yml] | `false`  |
| `ssh-sort-order`         | Sort the selected CSV column of SSH keys in the specified order                    | `desc`                      | [workflow.yml] | `false`  |
| `pat-sort`               | Sort the Personal Access Token CSV report by column (select column in JSON format) | `credential_authorized_at`  | [workflow.yml] | `false`  |
| `pat-sort-order`         | Sort the selected CSV column of Personal Access Tokens in the specified order      | `desc`                      | [workflow.yml] | `false`  |
| `deploy-keys-sort`       | Sort the Deploy Key CSV report by column (select column in JSON format)            | `date`                      | [workflow.yml] | `false`  |
| `deploy-keys-sort-order` | Sort the selected CSV column of Deploy Keys in the specified order                 | `desc`                      | [workflow.yml] | `false`  |
| `json`                   | Setting to generate an additional report in JSON format                            | `false`                     | [workflow.yml] | `false`  |
| `committer-name`         | The name of the committer that will appear in the Git history                      | `github-actions`            | [action.yml]   | `false`  |
| `committer-email`        | The committer email that will appear in the Git history                            | `github-actions@github.com` | [action.yml]   | `false`  |

[workflow.yml]: #Usage 'Usage'
[action.yml]: action.yml 'action.yml'

:bulb: JSON naming details used for sorting columns in the workflow file are specified below.

## CSV / JSON layout

### SSH key report

| CSV column                 | JSON                          | Description                                                   |
| :------------------------- | :---------------------------- | ------------------------------------------------------------- |
| `Username`                 | `login`                       | Name of the user the SSH key belongs to                       |
| `Credential Authorized At` | `credential_authorized_at`    | Date the SSH key was first allowed access to the organization |
| `Credential Accessed At`   | `credential_accessed_at`      | Date the SSH key was last accessed                            |
| `Credential Title`         | `authorized_credential_title` | Name of the SSH key                                           |

### Personal access token report

| CSV column                   | JSON                               | Description                                                         |
| :--------------------------- | :--------------------------------- | :------------------------------------------------------------------ |
| `Username`                   | `login`                            | Name of the user the token belongs to                               |
| `Credential Authorized At`   | `credential_authorized_at`         | Date the token was first allowed access to the organization         |
| `Credential Accessed At`     | `credential_accessed_at`           | Date the token was last accessed                                    |
| `Credential Expires At`      | `authorized_credential_expires_at` | Date the token will expire                                          |
| `Authorized Credential Note` | `authorized_credential_note`       | Name of the token                                                   |
| `repo`                       | `repo`                             | Full control of private repositories                                |
| `repo:status`                | `repo_status`                      | Access commit status                                                |
| `repo:deployment`            | `repo_deployment`                  | Access deployment status                                            |
| `public_repo`                | `public_repo`                      | Access public repositories                                          |
| `repo:invite`                | `repo_invite`                      | Access repository invitations                                       |
| `security_events`            | `security_events`                  | Read and write security events                                      |
| `workflow`                   | `workflow`                         | Update GitHub Action workflows                                      |
| `write:packages`             | `write_packages`                   | Upload packages to GitHub Package Registry                          |
| `read:packages`              | `read_packages`                    | Download packages from GitHub Package Registry                      |
| `delete:packages`            | `delete_packages`                  | Delete packages from GitHub Package Registry                        |
| `admin:org`                  | `admin_org`                        | Full control of orgs and teams, read and write org projects         |
| `write:org`                  | `write_org`                        | Read and write org and team membership, read and write org projects |
| `read:org`                   | `read_org`                         | Read org and team membership, read org projects                     |
| `admin:public_key`           | `admin_public_key`                 | Full control of user public keys                                    |
| `write:public_key`           | `write_public_key`                 | Write user public keys                                              |
| `read:public_key`            | `read_public_key`                  | Read user public keys                                               |
| `admin:repo_hook`            | `admin_repo_hook`                  | Full control of repository hooks                                    |
| `write:repo_hook`            | `write_repo_hook`                  | Write repository hooks                                              |
| `read:repo_hook`             | `read_repo_hook`                   | Read repository hooks                                               |
| `admin:org_hook`             | `admin_org_hook`                   | Full control of organization hooks                                  |
| `gist`                       | `gist`                             | Create gists                                                        |
| `notifications`              | `notifications`                    | Access notifications                                                |
| `user`                       | `user`                             | Update ALL user data                                                |
| `read:user`                  | `read_user`                        | Read ALL user profile data                                          |
| `user:email`                 | `user_email`                       | Access user email addresses (read-only)                             |
| `user:follow`                | `user_follow`                      | Follow and unfollow users                                           |
| `delete_repo`                | `delete_repo`                      | Delete repositories                                                 |
| `write:discussion`           | `write_discussion`                 | Read and write team discussions                                     |
| `read:discussion`            | `read_discussion`                  | Read team discussions                                               |
| `admin:enterprise`           | `admin_enterprise`                 | Full control of enterprises                                         |
| `manage_runners:enterprise`  | `manage_runners_enterprise`        | Manage enterprise runners and runner-groups                         |
| `manage_billing:enterprise`  | `manage_billing_enterprise`        | Read and write enterprise billing data                              |
| `read:enterprise`            | `read_enterprise`                  | Read enterprise profile data                                        |
| `site_admin`                 | `site_admin`                       | Access site administrator API endpoints                             |
| `devtools`                   | `devtools`                         | Access devtools API endpoints                                       |
| `biztools`                   | `biztools`                         | Access biztools API endpoints                                       |
| `codespace`                  | `codespace`                        | Full control of codespaces                                          |
| `codespace:secrets`          | `codespace_secrets`                | Ability to create, read, update, and delete codespace secrets       |
| `admin:gpg_key`              | `admin_gpg_key`                    | Full control of public user GPG keys                                |
| `write:gpg_key`              | `write_gpg_key`                    | Write public user GPG keys                                          |
| `read:gpg_key`               | `read_gpg_key`                     | Read public user GPG keys                                           |

### GitHub App installation report

| CSV column                     | JSON                               | Description                                                                      |
| :----------------------------- | :--------------------------------- | :------------------------------------------------------------------------------- |
| `GitHub App`                   | `slug`                             | The GitHub App name                                                              |
| `Install ID`                   | `install_id`                       | The GitHub App installation ID                                                   |
| `App ID`                       | `app_id`                           | The GitHub App ID                                                                |
| `Repos`                        | `repos`                            | Repositories the GitHub App installation is enabled for                          |
| `Repo: Actions`                | `actions`                          | Workflows, workflow runs and artifacts                                           |
| `Repo: Administration`         | `administration`                   | Repository creation, deletion, settings, teams, and collaborators                |
| `Repo: Checks`                 | `checks`                           | Checks on code                                                                   |
| `Repo: Code scanning alerts`   | `security_events`                  | View and manage security events like code scanning alerts                        |
| `Repo: Commit statuses`        | `statuses`                         | Commit statuses                                                                  |
| `Repo: Contents`               | `contents`                         | Repository contents, commits, branches, downloads, releases, and merges          |
| `Repo: Dependabot alerts`      | `vulnerability_alerts`             | Retrieve Dependabot alerts                                                       |
| `Repo: Dependabot secrets`     | `dependabot_secrets`               | Manage Dependabot repository secrets                                             |
| `Repo: Deployments`            | `deployments`                      | Deployments and deployment statuses                                              |
| `Repo: Discussions`            | `discussions`                      | Discussions and related comments and labels                                      |
| `Repo: Environments`           | `environments`                     | Manage repository environments                                                   |
| `Repo: Issues`                 | `issues`                           | Issues and related comments, assignees, labels, and milestones                   |
| `Repo: Metadata`               | `metadata`                         | Search repositories, list collaborators, and access repository metadata          |
| `Repo: Packages`               | `packages`                         | Packages published to the GitHub Package Platform                                |
| `Repo: Pages`                  | `pages`                            | Retrieve Pages statuses, configuration, and builds, as well as create new builds |
| `Repo: Projects`               | `repository_projects`              | Manage repository projects, columns, and cards                                   |
| `Repo: Pull requests`          | `pull_requests`                    | Pull requests and related comments, assignees, labels, milestones, and merges    |
| `Repo: Secret scanning alerts` | `secret_scanning_alerts`           | View and manage secret scanning alerts                                           |
| `Repo: Secrets`                | `secrets`                          | Manage Actions repository secrets                                                |
| `Repo: Single file`            | `single_file`                      | Manage just a single file                                                        |
| `Repo: Webhooks`               | `repository_hooks`                 | Manage the post-receive hooks for a repository                                   |
| `Repo: Workflows`              | `workflows`                        | Update GitHub Action workflow files                                              |
| `Org: Administration`          | `organization_administration`      | Manage access to an organization                                                 |
| `Org: Blocking users`          | `organization_user_blocking`       | View and manage users blocked by the organization                                |
| `Org: Events`                  | `organization_events`              | View events triggered by an activity in an organization                          |
| `Org: Members`                 | `members`                          | Organization members and teams                                                   |
| `Org: Dependabot secrets`      | `organization_dependabot_secrets`  | Manage Dependabot organization secrets                                           |
| `Org: Plan`                    | `organization_plan`                | View an organization's plan                                                      |
| `Org: Projects`                | `organization_projects`            | Manage organization projects and projects beta (where available)                 |
| `Org: Secrets`                 | `organization_secrets`             | Manage Actions organization secrets                                              |
| `Org: Self-hosted runners`     | `organization_self_hosted_runners` | View and manage Actions self-hosted runners available to an organization         |
| `Org: Team discussions`        | `team_discussions`                 | Manage team discussions and related comments                                     |
| `Org: Webhooks`                | `organization_hooks`               | Manage the post-receive hooks for an organization                                |
| `Org: Packages`                | `organization_packages`            | Manage packages for an organization                                              |

### Deploy key report

| CSV column     | JSON       | Description                                                |
| :------------- | :--------- | :--------------------------------------------------------- |
| `Repo`         | `repo`     | Repository the deploy key was added to                     |
| `Date Created` | `date`     | Date the deploy key was created                            |
| `Read Only`    | `readOnly` | Shows if the deploy key has write or read-only permissions |
| `Title`        | `title`    | Name of the deploy key                                     |

A CSV report file will be saved in the repository **reports** folder using the following naming format: **`organization`-`auth-type`.csv**.

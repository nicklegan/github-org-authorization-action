# GitHub Organization Authorization Action

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
        uses: nicklegan/github-org-authorization-action@v1.0.1
        with:
          token: ${{ secrets.ORG_TOKEN }}
          organization: ''
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

| Name              | Description                                                   | Default                     | Options        | Required |
| :---------------- | :------------------------------------------------------------ | :-------------------------- | :------------- | :------- |
| `org`             | Organization different than the default workflow context      |                             | [workflow.yml] | `false`  |
| `committer-name`  | The name of the committer that will appear in the Git history | `github-actions`            | [action.yml]   | `false`  |
| `committer-email` | The committer email that will appear in the Git history       | `github-actions@github.com` | [action.yml]   | `false`  |

[workflow.yml]: #Usage 'Usage'
[action.yml]: action.yml 'action.yml'

## CSV layout

### SSH key report

| Column                   | Description                                                   |
| :----------------------- | :------------------------------------------------------------ |
| Username                 | Name of the user the SSH key belongs to                       |
| Credential Authorized At | Date the SSH key was first allowed access to the organization |
| Credential Accessed At   | Date the SSH key was last accessed                            |
| Credential Title         | Name of the SSH key                                           |

### Personal access token report

| Column                     | Description                                                         |
| :------------------------- | :------------------------------------------------------------------ |
| Username                   | Name of the user the token belongs to                               |
| Credential Authorized At   | Date the token was first allowed access to the organization         |
| Credential Accessed At     | Date the token was last accessed                                    |
| Credential Expires At      | Date the token will expire                                          |
| Authorized Credential Note | Name of the token                                                   |
| repo                       | Full control of private repositories                                |
| repo:status                | Access commit status                                                |
| repo:deployment            | Access deployment status                                            |
| public_repo                | Access public repositories                                          |
| repo:invite                | Access repository invitations                                       |
| security_events            | Read and write security events                                      |
| workflow                   | Update GitHub Action workflows                                      |
| write:packages             | Upload packages to GitHub Package Registry                          |
| read:packages              | Download packages from GitHub Package Registry                      |
| delete:packages            | Delete packages from GitHub Package Registry                        |
| admin:org                  | Full control of orgs and teams, read and write org projects         |
| write:org                  | Read and write org and team membership, read and write org projects |
| read:org                   | Read org and team membership, read org projects                     |
| admin:public_key           | Full control of user public keys                                    |
| write:public_key           | Write user public keys                                              |
| read:public_key            | Read user public keys                                               |
| admin:repo_hook            | Full control of repository hooks                                    |
| write:repo_hook            | Write repository hooks                                              |
| read:repo_hook             | Read repository hooks                                               |
| admin:org_hook             | Full control of organization hooks                                  |
| gist                       | Create gists                                                        |
| notifications              | Access notifications                                                |
| user                       | Update ALL user data                                                |
| read:user                  | Read ALL user profile data                                          |
| user:email                 | Access user email addresses (read-only)                             |
| user:follow                | Follow and unfollow users                                           |
| delete_repo                | Delete repositories                                                 |
| write:discussion           | Read and write team discussions                                     |
| read:discussion            | Read team discussions                                               |
| admin:enterprise           | Full control of enterprises                                         |
| manage_runners:enterprise  | Manage enterprise runners and runner-groups                         |
| manage_billing:enterprise  | Read and write enterprise billing data                              |
| read:enterprise            | Read enterprise profile data                                        |
| site_admin                 | Access site administrator API endpoints                             |
| devtools                   | Access devtools API endpoints                                       |
| biztools                   | Access biztools API endpoints                                       |
| codespace                  | Full control of codespaces                                          |
| codespace:secrets          | Ability to create, read, update, and delete codespace secrets       |
| admin:gpg_key              | Full control of public user GPG keys                                |
| write:gpg_key              | Write public user GPG keys                                          |
| read:gpg_key               | Read public user GPG keys                                           |

### GitHub App installation report

| Column                       | Description                                                                      |
| :--------------------------- | :------------------------------------------------------------------------------- |
| GitHub App                   | The GitHub App name                                                              |
| Install ID                   | The GitHub App installation ID                                                   |
| App ID                       | The GitHub App ID                                                                |
| Repos                        | Repositories the GitHub App installation is enabled for                          |
| Repo: Actions                | Workflows, workflow runs and artifacts                                           |
| Repo: Administration         | Repository creation, deletion, settings, teams, and collaborators                |
| Repo: Checks                 | Checks on code                                                                   |
| Repo: Code scanning alerts   | View and manage security events like code scanning alerts                        |
| Repo: Commit statuses        | Commit statuses                                                                  |
| Repo: Contents               | Repository contents, commits, branches, downloads, releases, and merges          |
| Repo: Dependabot alerts      | Retrieve Dependabot alerts                                                       |
| Repo: Dependabot secrets     | Manage Dependabot repository secrets                                             |
| Repo: Deployments            | Deployments and deployment statuses                                              |
| Repo: Discussions            | Discussions and related comments and labels                                      |
| Repo: Environments           | Manage repository environments                                                   |
| Repo: Issues                 | Issues and related comments, assignees, labels, and milestones                   |
| Repo: Metadata               | Search repositories, list collaborators, and access repository metadata          |
| Repo: Packages               | Packages published to the GitHub Package Platform                                |
| Repo: Pages                  | Retrieve Pages statuses, configuration, and builds, as well as create new builds |
| Repo: Projects               | Manage repository projects, columns, and cards                                   |
| Repo: Pull requests          | Pull requests and related comments, assignees, labels, milestones, and merges    |
| Repo: Secret scanning alerts | View and manage secret scanning alerts                                           |
| Repo: Secrets                | Manage Actions repository secrets                                                |
| Repo: Single file            | Manage just a single file                                                        |
| Repo: Webhooks               | Manage the post-receive hooks for a repository                                   |
| Repo: Workflows              | Update GitHub Action workflow files                                              |
| Org: Administration          | Manage access to an organization                                                 |
| Org: Blocking users          | View and manage users blocked by the organization                                |
| Org: Events                  | View events triggered by an activity in an organization                          |
| Org: Members                 | Organization members and teams                                                   |
| Org: Dependabot secrets      | Manage Dependabot organization secrets                                           |
| Org: Plan                    | View an organization's plan                                                      |
| Org: Projects                | Manage organization projects and projects beta (where available)                 |
| Org: Secrets                 | Manage Actions organization secrets                                              |
| Org: Self-hosted runners     | View and manage Actions self-hosted runners available to an organization         |
| Org: Team discussions        | Manage team discussions and related comments                                     |
| Org: Webhooks                | Manage the post-receive hooks for an organization                                |
| Org: Packages                | Manage packages for an organization                                              |

### Deploy key report

| Column       | Description                                                |
| :----------- | :--------------------------------------------------------- |
| Repo         | Repository the deploy key was added to                     |
| Date Created | Date the deploy key was created                            |
| Read Only    | Shows if the deploy key has write or read-only permissions |
| Title        | Name of the deploy key                                     |

A CSV report file will be saved in the repository **reports** folder using the following naming format: **{organization}-{auth-type}.csv**.

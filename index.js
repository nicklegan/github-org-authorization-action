const core = require('@actions/core')
const github = require('@actions/github')
const { orderBy } = require('natural-orderby')
const { stringify } = require('csv-stringify/sync')
const token = core.getInput('token', { required: true })
const octokit = github.getOctokit(token)
const eventPayload = require(process.env.GITHUB_EVENT_PATH)
const { owner, repo } = github.context.repo

const committerName = core.getInput('committer-name', { required: false }) || 'github-actions'
const committerEmail = core.getInput('committer-email', { required: false }) || 'github-actions@github.com'
const org = core.getInput('org', { required: false }) || eventPayload.organization.login
const jsonExport = core.getInput('json', { required: false }) || 'false'
const sortAppColumn = core.getInput('app-sort', { required: false }) || 'install_id'
const sortAppOrder = core.getInput('app-sort-order', { required: false }) || 'desc'
const sortSshColumn = core.getInput('ssh-sort', { required: false }) || 'credential_authorized_at'
const sortSshOrder = core.getInput('ssh-sort-order', { required: false }) || 'desc'
const sortPatColumn = core.getInput('pat-sort', { required: false }) || 'credential_authorized_at'
const sortPatOrder = core.getInput('pat-sort-order', { required: false }) || 'desc'
const sortDeployKeyColumn = core.getInput('deploy-key-sort', { required: false }) || 'date'
const sortDeployKeyOrder = core.getInput('deploy-key-sort-order', { required: false }) || 'desc'

;(async () => {
  try {
    await patssh()
    await app()
    await deployKeys()
  } catch (error) {
    core.setFailed(error.message)
  }
})()

// Retrieve PATs and SSH keys
async function patssh() {
  try {
    const sshArray = []
    const patArray = []

    console.log('Retrieving PATs and SSH keys')

    const dataJSON = await octokit.paginate('GET /orgs/{org}/credential-authorizations', {
      org: org
    })

    dataJSON.forEach((auth) => {
      const login = auth.login
      const credential_type = auth.credential_type
      const authorized_credential_title = auth.authorized_credential_title
      const authorized_credential_note = auth.authorized_credential_note
      const authorized_credential_expires_at = (auth.authorized_credential_expires_at || '').slice(0, 10)
      const credential_authorized_at = (auth.credential_authorized_at || '').slice(0, 10)
      const credential_accessed_at = (auth.credential_accessed_at || '').slice(0, 10)

      let res = {}
      for (let key in auth.scopes) {
        res[auth.scopes[key]] = true
      }

      let str = JSON.stringify(res)

      str = str.replace(/repo:status/g, 'repo_status')
      str = str.replace(/repo:invite/g, 'repo_invite')
      str = str.replace(/write:packages/g, 'write_packages')
      str = str.replace(/read:packages/g, 'read_packages')
      str = str.replace(/delete:packages/g, 'delete_packages')
      str = str.replace(/admin:org/g, 'admin_org')
      str = str.replace(/write:org/g, 'write_org')
      str = str.replace(/read:org/g, 'read_org')
      str = str.replace(/admin:public_key/g, 'admin_public_key')
      str = str.replace(/write:public_key/g, 'write_public_key')
      str = str.replace(/read:public_key/g, 'read_public_key')
      str = str.replace(/admin:repo_hook/g, 'admin_repo_hook')
      str = str.replace(/write:repo_hook/g, 'write_repo_hook')
      str = str.replace(/read:repo_hook/g, 'read_repo_hook')
      str = str.replace(/admin:org_hook/g, 'admin_org_hook')
      str = str.replace(/read:user/g, 'read_user')
      str = str.replace(/user:email/g, 'user_email')
      str = str.replace(/user:follow/g, 'user_follow')
      str = str.replace(/write:discussion/g, 'write_discussion')
      str = str.replace(/read:discussion/g, 'read_discussion')
      str = str.replace(/admin:enterprise/g, 'admin_enterprise')
      str = str.replace(/manage_runners:enterprise/g, 'manage_runners_enterprise')
      str = str.replace(/manage_billing:enterprise/g, 'manage_billing_enterprise')
      str = str.replace(/read:enterprise/g, 'read_enterprise')
      str = str.replace(/codespace:secrets/g, 'codespace_secrets')
      str = str.replace(/admin:gpg_key/g, 'admin_gpg_key')
      str = str.replace(/write:gpg_key/g, 'write_gpg_key')
      str = str.replace(/read:gpg_key/g, 'read_gpg_key')

      object = JSON.parse(str)

      const repo = object.repo || ''
      const repo_status = object.repo_status || ''
      const repo_deployment = object.repo_deployment || ''
      const public_repo = object.public_repo || ''
      const repo_invite = object.repo_invite || ''
      const security_events = object.security_events || ''
      const workflow = object.workflow || ''
      const write_packages = object.write_packages || ''
      const read_packages = object.read_packages || ''
      const delete_packages = object.delete_packages || ''
      const admin_org = object.admin_org || ''
      const write_org = object.write_org || ''
      const read_org = object.read_org || ''
      const admin_public_key = object.admin_public_key || ''
      const write_public_key = object.write_public_key || ''
      const read_public_key = object.read_public_key || ''
      const admin_repo_hook = object.admin_repo_hook || ''
      const write_repo_hook = object.write_repo_hook || ''
      const read_repo_hook = object.read_repo_hook || ''
      const admin_org_hook = object.admin_org_hook || ''
      const gist = object.gist || ''
      const notifications = object.notifications || ''
      const user = object.user || ''
      const read_user = object.read_user || ''
      const user_email = object.user_email || ''
      const user_follow = object.user_follow || ''
      const delete_repo = object.delete_repo || ''
      const write_discussion = object.write_discussion || ''
      const read_discussion = object.read_discussion || ''
      const admin_enterprise = object.admin_enterprise || ''
      const manage_runners_enterprise = object.manage_runners_enterprise || ''
      const manage_billing_enterprise = object.manage_billing_enterprise || ''
      const read_enterprise = object.read_enterprise || ''
      const site_admin = object.site_admin || ''
      const devtools = object.devtools || ''
      const biztools = object.biztools || ''
      const codespace = object.codespace || ''
      const codespace_secrets = object.codespace_secrets || ''
      const admin_gpg_key = object.admin_gpg_key || ''
      const write_gpg_key = object.write_gpg_key || ''
      const read_gpg_key = object.read_gpg_key || ''

      if (credential_type === 'SSH key') {
        sshArray.push({ login, credential_authorized_at, credential_accessed_at, authorized_credential_title })
      } else {
        patArray.push({
          login,
          credential_authorized_at,
          credential_accessed_at,
          authorized_credential_expires_at,
          authorized_credential_note,
          repo,
          repo_status,
          repo_deployment,
          public_repo,
          repo_invite,
          security_events,
          workflow,
          write_packages,
          read_packages,
          delete_packages,
          admin_org,
          write_org,
          read_org,
          admin_public_key,
          write_public_key,
          read_public_key,
          admin_repo_hook,
          write_repo_hook,
          read_repo_hook,
          admin_org_hook,
          gist,
          notifications,
          user,
          read_user,
          user_email,
          user_follow,
          delete_repo,
          write_discussion,
          read_discussion,
          admin_enterprise,
          manage_runners_enterprise,
          manage_billing_enterprise,
          read_enterprise,
          site_admin,
          devtools,
          biztools,
          codespace,
          codespace_secrets,
          admin_gpg_key,
          write_gpg_key,
          read_gpg_key
        })
      }
    })
    await formatPat(patArray)
    await formatSSH(sshArray)
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Format PAT data
async function formatPat(patArray) {
  try {
    const columns = {
      login: 'Username',
      credential_authorized_at: 'Credential Authorized At',
      credential_accessed_at: 'Credential Accessed At',
      authorized_credential_expires_at: 'Credential Expires At',
      authorized_credential_note: 'Authorized Credential Note',
      repo: 'repo',
      repo_status: 'repo:status',
      repo_deployment: 'repo:deployment',
      public_repo: 'public_repo',
      repo_invite: 'repo:invite',
      security_events: 'security_events',
      workflow: 'workflow',
      write_packages: 'write:packages',
      read_packages: 'read:packages',
      delete_packages: 'delete:packages',
      admin_org: 'admin:org',
      write_org: 'write:org',
      read_org: 'read:org',
      admin_public_key: 'admin:public_key',
      write_public_key: 'write:public_key',
      read_public_key: 'read:public_key',
      admin_repo_hook: 'admin:repo_hook',
      write_repo_hook: 'write:repo_hook',
      read_repo_hook: 'read:repo_hook',
      admin_org_hook: 'admin:org_hook',
      gist: 'gist',
      notifications: 'notifications',
      user: 'user',
      read_user: 'read:user',
      user_email: 'user:email',
      user_follow: 'user:follow',
      delete_repo: 'delete_repo',
      write_discussion: 'write:discussion',
      read_discussion: 'read:discussion',
      admin_enterprise: 'admin:enterprise',
      manage_runners_enterprise: 'manage_runners:enterprise',
      manage_billing_enterprise: 'manage_billing:enterprise',
      read_enterprise: 'read:enterprise',
      site_admin: 'site_admin',
      devtools: 'devtools',
      biztools: 'biztools',
      codespace: 'codespace',
      codespace_secrets: 'codespace:secrets',
      admin_gpg_key: 'admin:gpg_key',
      write_gpg_key: 'write:gpg_key',
      read_gpg_key: 'read:gpg_key'
    }

    const reportPath = { path: `reports/${org}-PAT-list.csv` }
    const jsonPath = { path: `reports/${org}-PAT-list.json` }
    const sortArray = orderBy(patArray, [sortPatColumn], [sortPatOrder])
    const csvArray = stringify(sortArray, {
      header: true,
      columns: columns,
      cast: {
        boolean: function (value) {
          return value ? 'TRUE' : 'FALSE'
        }
      }
    })

    const csv = { content: Buffer.from(csvArray).toString('base64') }
    const json = { content: Buffer.from(JSON.stringify(patArray, null, 2)).toString('base64') }
    await pushReport(csv, reportPath)
    if (jsonExport === 'true') {
      await pushJsonReport(json, jsonPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Format SSH data
async function formatSSH(sshArray) {
  try {
    const columns = {
      login: 'Username',
      credential_authorized_at: 'Credential Authorized At',
      credential_accessed_at: 'Credential Accessed At',
      authorized_credential_title: 'Credential Title'
    }

    const reportPath = { path: `reports/${org}-SSH-list.csv` }
    const jsonPath = { path: `reports/${org}-SSH-list.json` }
    const sortArray = orderBy(sshArray, [sortSshColumn], [sortSshOrder])
    const csvArray = stringify(sortArray, {
      header: true,
      columns: columns
    })

    const csv = { content: Buffer.from(csvArray).toString('base64') }
    const json = { content: Buffer.from(JSON.stringify(sshArray, null, 2)).toString('base64') }
    await pushReport(csv, reportPath)
    if (jsonExport === 'true') {
      await pushJsonReport(json, jsonPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Retrieve GitHub Apps
async function app() {
  try {
    const appArray = []

    console.log('Retrieving GitHub Apps')

    const dataJSON = await octokit.paginate('GET /orgs/{org}/installations', {
      org: org
    })

    dataJSON.forEach((auth) => {
      const slug = auth.app_slug
      const install_id = auth.id
      const app_id = auth.app_id
      const repos = auth.repository_selection
      const created = (auth.created_at || '').slice(0, 10)
      const updated = (auth.updated_at || '').slice(0, 10)
      const suspended = (auth.suspended_at || '').slice(0, 10)

      const pages = auth.permissions.pages
      const checks = auth.permissions.checks
      const issues = auth.permissions.issues
      const actions = auth.permissions.actions
      const members = auth.permissions.members
      const secrets = auth.permissions.secrets
      const contents = auth.permissions.contents
      const metadata = auth.permissions.metadata
      const packages = auth.permissions.packages
      const statuses = auth.permissions.statuses
      const workflows = auth.permissions.workflows
      const deployments = auth.permissions.deployments
      const discussions = auth.permissions.discussions
      const single_file = auth.permissions.single_file
      const environments = auth.permissions.environments
      const pull_requests = auth.permissions.pull_requests
      const administration = auth.permissions.administration
      const security_events = auth.permissions.security_events
      const repository_hooks = auth.permissions.repository_hooks
      const team_discussions = auth.permissions.team_discussions
      const organization_plan = auth.permissions.organization_plan
      const dependabot_secrets = auth.permissions.dependabot_secrets
      const organization_hooks = auth.permissions.organization_hooks
      const organization_events = auth.permissions.organization_events
      const repository_projects = auth.permissions.repository_projects
      const organization_secrets = auth.permissions.organization_secrets
      const vulnerability_alerts = auth.permissions.vulnerability_alerts
      const organization_packages = auth.permissions.organization_packages
      const organization_projects = auth.permissions.organization_projects
      const secret_scanning_alerts = auth.permissions.secret_scanning_alerts
      const organization_user_blocking = auth.permissions.organization_user_blocking
      const organization_administration = auth.permissions.organization_administration
      const organization_dependabot_secrets = auth.permissions.organization_dependabot_secrets
      const organization_self_hosted_runners = auth.permissions.organization_self_hosted_runners

      appArray.push({
        slug,
        install_id,
        app_id,
        repos,
        created,
        updated,
        suspended,
        pages,
        checks,
        issues,
        actions,
        members,
        secrets,
        contents,
        metadata,
        packages,
        statuses,
        workflows,
        deployments,
        discussions,
        single_file,
        environments,
        pull_requests,
        administration,
        security_events,
        repository_hooks,
        team_discussions,
        organization_plan,
        dependabot_secrets,
        organization_hooks,
        organization_events,
        repository_projects,
        organization_secrets,
        vulnerability_alerts,
        organization_packages,
        organization_projects,
        secret_scanning_alerts,
        organization_user_blocking,
        organization_administration,
        organization_dependabot_secrets,
        organization_self_hosted_runners
      })
    })
    formatApp(appArray)
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Format GitHub App data
async function formatApp(appArray) {
  try {
    const columns = {
      slug: 'GitHub App',
      install_id: 'Install ID',
      app_id: 'App ID',
      repos: 'Repos',
      created: 'Created',
      updated: 'Updated',
      suspended: 'Suspended',

      // Repository level permissions
      actions: 'Repo: Actions',
      administration: 'Repo: Administration',
      checks: 'Repo: Checks',
      security_events: 'Repo: Code scanning alerts',
      statuses: 'Repo: Commit statuses',
      contents: 'Repo: Contents',
      vulnerability_alerts: 'Repo: Dependabot alerts',
      dependabot_secrets: 'Repo: Dependabot secrets',
      deployments: 'Repo: Deployments',
      discussions: 'Repo: Discussions',
      environments: 'Repo: Environments',
      issues: 'Repo: Issues',
      metadata: 'Repo: Metadata',
      packages: 'Repo: Packages',
      pages: 'Repo: Pages',
      repository_projects: 'Repo: Projects',
      pull_requests: 'Repo: Pull requests',
      secret_scanning_alerts: 'Repo: Secret scanning alerts',
      secrets: 'Repo: Secrets',
      single_file: 'Repo: Single file',
      repository_hooks: 'Repo: Webhooks',
      workflows: 'Repo: Workflows',

      // Organization level permissions
      organization_administration: 'Org: Administration',
      organization_user_blocking: 'Org: Blocking users',
      organization_events: 'Org: Events',
      members: 'Org: Members',
      organization_dependabot_secrets: 'Org: Dependabot secrets',
      organization_plan: 'Org: Plan',
      organization_projects: 'Org: Projects',
      organization_secrets: 'Org: Secrets',
      organization_self_hosted_runners: 'Org: Self-hosted runners',
      team_discussions: 'Org: Team discussions',
      organization_hooks: 'Org: Webhooks',
      organization_packages: 'Org: Packages'
    }

    const reportPath = { path: `reports/${org}-APP-list.csv` }
    const jsonPath = { path: `reports/${org}-APP-list.json` }
    const sortArray = orderBy(appArray, [sortAppColumn], [sortAppOrder])
    const csvArray = stringify(sortArray, {
      header: true,
      columns: columns
    })

    const csv = { content: Buffer.from(csvArray).toString('base64') }
    const json = { content: Buffer.from(JSON.stringify(appArray, null, 2)).toString('base64') }
    await pushReport(csv, reportPath)
    if (jsonExport === 'true') {
      await pushJsonReport(json, jsonPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Retrieve deploy keys
async function deployKeys() {
  try {
    console.log('Retrieving deploy keys')

    const deployKeyArray = []
    let endCursor = null
    const query = `query ($org: String! $cursorID: String) {
      organization(login: $org ) {
        repositories(first: 100, after: $cursorID) {  
          nodes {
            name
            deployKeys(first: 100, after: null) {
              totalCount
              nodes {
                title
                createdAt
                readOnly
                id
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    `

    let hasNextPage = false
    let dataJSON = null

    do {
      dataJSON = await octokit.graphql({
        query,
        org: org,
        cursorID: endCursor
      })

      const auths = dataJSON.organization.repositories.nodes
      hasNextPage = dataJSON.organization.repositories.pageInfo.hasNextPage

      for (const auth of auths) {
        if (hasNextPage) {
          endCursor = dataJSON.organization.repositories.pageInfo.endCursor
        } else {
          endCursor = null
        }

        if (auth.deployKeys.totalCount == 0) continue
        const repo = auth.name
        const date = auth.deployKeys.nodes[0].createdAt.slice(0, 10) || ''
        const readOnly = auth.deployKeys.nodes[0].readOnly
        const title = auth.deployKeys.nodes[0].title

        deployKeyArray.push({ repo, date, readOnly, title })
      }
    } while (hasNextPage)
    await formatDeployKey(deployKeyArray)
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Format deploy key data
async function formatDeployKey(deployKeyArray) {
  try {
    const columns = {
      repo: 'Repo',
      date: 'Date Created',
      readOnly: 'Read Only',
      title: 'Title'
    }

    const reportPath = { path: `reports/${org}-DEPLOYKEY-list.csv` }
    const jsonPath = { path: `reports/${org}-DEPLOYKEY-list.json` }
    const sortArray = orderBy(deployKeyArray, [sortDeployKeyColumn], [sortDeployKeyOrder])
    const csvArray = stringify(sortArray, {
      header: true,
      columns: columns,
      cast: {
        boolean: function (value) {
          return value ? 'TRUE' : 'FALSE'
        }
      }
    })

    const csv = { content: Buffer.from(csvArray).toString('base64') }
    const json = { content: Buffer.from(JSON.stringify(deployKeyArray, null, 2)).toString('base64') }
    await pushReport(csv, reportPath)
    if (jsonExport === 'true') {
      await pushJsonReport(json, jsonPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Push reports to GitHub
async function pushReport(csv, reportPath) {
  try {
    const opts = {
      owner,
      repo,
      message: `${new Date().toISOString().slice(0, 10)} Authorization report`,
      committer: {
        name: committerName,
        email: committerEmail
      }
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        ...reportPath
      })

      if (data && data.sha) {
        reportPath.sha = data.sha
      }
    } catch (error) {}

    await octokit.rest.repos.createOrUpdateFileContents({
      ...opts,
      ...csv,
      ...reportPath
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Push JSON reports to GitHub
async function pushJsonReport(json, jsonPath) {
  try {
    const opts = {
      owner,
      repo,
      message: `${new Date().toISOString().slice(0, 10)} Authorization report`,
      committer: {
        name: committerName,
        email: committerEmail
      }
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        ...jsonPath
      })

      if (data && data.sha) {
        reportPath.sha = data.sha
      }
    } catch (error) {}

    await octokit.rest.repos.createOrUpdateFileContents({
      ...opts,
      ...json,
      ...jsonPath
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

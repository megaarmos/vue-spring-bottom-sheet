const packagePath = 'packages/vue-spring-bottom-sheet'

export default {
  branches: [
    'master',
    { name: 'next', prerelease: true },
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [{ type: 'docs', scope: 'README', release: 'patch' }],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: `${packagePath}/CHANGELOG.md`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: packagePath,
        npmPublish: true,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [`${packagePath}/package.json`, `${packagePath}/CHANGELOG.md`],
        message: `chore(release): \${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}`,
      },
    ],
    '@semantic-release/github',
  ],
}

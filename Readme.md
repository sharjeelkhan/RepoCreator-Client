### Build (only required once on checkout)
```
# Get a GitHub auth token with public_repo access: https://help.github.com/articles/creating-an-access-token-for-command-line-use/
#linux
export JSPM_GITHUB_AUTH_TOKEN=auth-token-from-previous-step-goes-here
#windows
set JSPM_GITHUB_AUTH_TOKEN=auth-token-from-previous-step-goes-here
npm install
node_modules/.bin/jspm config registries.bower.handler jspm-bower-endpoint
node_modules/.bin/jspm config registries.bower.timeouts.lookup 300
node_modules/.bin/jspm config registries.bower.timeouts.build 300
node_modules/.bin/jspm config registries.github.timeouts.lookup 300
node_modules/.bin/jspm config registries.github.timeouts.build 300
node_modules/.bin/jspm config registries.github.auth %JSPM_GITHUB_AUTH_TOKEN%
node_modules/.bin/jspm config registries.npm.timeouts.lookup 300
node_modules/.bin/jspm config registries.npm.timeouts.build 300
node_modules/.bin/jspm install
```

### Run
```
npm start
```

### Install or Update NPM package
```
npm install --save-dev <package-name>
```

### Install or Update JSPM package
```
node_modules/.bin/jspm install <package-name>
```

### Update Runtime Transpiler
```
node_modules/.bin/jspm dl-loader --latest
```

### Update Runtime Transpiler to vnext (until [npm tag support](https://github.com/jspm/npm/issues/61) is added to JSPM)
> TODO: Test if this actually works.

```
npm dist-tag ls typescript
node_modules/.bin/jspm install --dev typescript@<next-version-from-first-command-result>
```

### Update Aurelia
> Note: Verify that this list of dependencies is all that is used by searching through the project for `import.*from .aurelia-.*`

```
node_modules/.bin/jspm install aurelia-bootstrapper aurelia-dependency-injection aurelia-event-aggregator aurelia-router aurelia-templating aurelia-binding aurelia-http-client aurelia-computed
```

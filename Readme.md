### Build
```
npm install
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
node_modules/.bin/jspm install --dev typescript
```

### Update Runtime Transpiler to vnext (until [npm tag support](https://github.com/jspm/npm/issues/61) is added to JSPM)
```
npm dist-tag ls typescript
node_modules/.bin/jspm install --dev typescript@<next-version-from-first-command-result>
```

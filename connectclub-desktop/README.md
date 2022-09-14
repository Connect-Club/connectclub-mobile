# ConnectClub Desktop

Desktop version of the ConnectClub app built using Electron, react-native and react-native-web.

## Build desktop app

Install dependencies in root project, and after that inside connectlub-desktop:
```
yarn
```

connectclub-desktop dependencies are not hoisted to the upper level to prevent conflicts in e.g. react-scripts which otherwise will use prettier config from root.

Build the react app:
```
yarn run react:build
```

This will produce a build folder with transpiled bundle.

After that build the Electron app:
```
yarn run electron:build
```

It will produce build artifacts in the dist folder. The app can be run from this folder. E.g. on linux the runnable app binary would be connectclub-electron-1.0.0.AppImage.

## TODO

* Need to provide eslintrc settings which are local to connectclub-desktop. Parent eslint.rc makes react build fail. Temporary workaround - disable eslint altogether for Electron app...
# Setup
Install brew from [here](https://brew.sh) (copy command in terminal)

Install npm:
```sh
brew install node
```

Install yarn:
```sh
npm install --global yarn
```

# Dependencies Installation
```sh
yarn install && npx pod-install && npx rn-nodeify --install --hack
```

# Known Issues

If app won't build due to error with **main.jsbundle** file, you should run:
```sh
yarn run build:ios
```
This will generate new **main.jsbundle**

If app won't build due some dependencies errors (red fatal on start), FIRST you do:
```sh
rm yarn.lock
rm ios/podfile.lock
yarn install && npx pod-install
```
SECOND if you still struggle with running application -> poke some mobile developer

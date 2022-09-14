const path = require('path')
const webpack = require('webpack')
const {addWebpackModuleRule, addWebpackPlugin} = require('customize-cra')

// A list of paths to transpile
const nodeModulesToTranspileRel = [
  '../src',
  '../node_modules/react-native-reanimated',
  '../node_modules/react-native-raw-bottom-sheet',
  '../node_modules/react-native-notifier',
]
const nodeModulesToTranspileAbs = nodeModulesToTranspileRel.map((name) =>
  path.resolve(__dirname, name),
)

// https://github.com/facebook/create-react-app/issues/9127#issuecomment-792650009
module.exports = (config) => {
  // Remove the ModuleScopePlugin which throws when we try to import something
  // outside of src/.
  config.resolve.plugins.pop()

  // https://stackoverflow.com/questions/57195354/attempted-import-errors-in-react-native-web-monorepo-architecture
  config.module.strictExportPresence = false

  // Find the babel-loader rule
  const babelLoaderRule = config.module.rules[1].oneOf.find((rule) =>
    rule.loader.includes('babel-loader'),
  )

  // Add the paths we want to transpile
  babelLoaderRule.include = [
    babelLoaderRule.include,
    ...nodeModulesToTranspileAbs,
  ]

  // https://github.com/necolas/react-native-web/issues/1497#issuecomment-761947037
  const rule = {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
      loader: 'url-loader',
      options: {
        name: '[name].[ext]',
        esModule: false,
      },
    },
  }

  addWebpackPlugin(
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
      __DEV__: process.env.NODE_ENV === 'development' || false,
    }),
  )(config)
  addWebpackModuleRule(rule)(config)

  return config
}

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const hash = 'hash:base64:8'

const RULES = {
  javascript: {
    test: /\.js$/,
    exclude: /node_modules/,
    use: ['babel-loader', 'eslint-loader']
  },

  css: {
    // css-loader: resolve/load required/imported CSS dependencies from JavaScript
    // style-loader: wrap CSS string from css-loader with <style> tag
    // Note: loaders are applied from right to left, i.e. css-loader -> style-loader
    //
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  },

  image: {
    test: /\.(png|svg|jpg|gif)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: `img/[name]__[${hash}].[ext]`
      }
    }]
  },

  font: {
    test: /\.(eot|svg|ttf|woff|woff2)$/,
    use: [{ loader: `file-loader?name=font/[name]__[${hash}].[ext]` }]
  }
}

const rules = () => Object.values(RULES)
const mode = env => env.production ? 'production' : 'development'

const webapp = (env, argv) => ({
  context: path.resolve(__dirname, 'src'),

  // In production mode webpack applies internal optimization/minification:
  // no additional plugins necessary.
  // For advanced options: babel-minify-webpack-plugin: https://webpack.js.org/plugins/babel-minify-webpack-plugin
  mode: mode(env),
  stats: 'errors-only',
  module: { rules: rules() },
  entry: {
    renderer: ['./index.js']
  },

  plugins: [
    new HtmlWebpackPlugin({ title: 'Picassa' })
  ]
})

const devtool = env => {
  if (env.production) return ({}) // no source maps for production
  return ({
    devtool: 'eval-source-map'
  })
}

module.exports = (env, argv) => {
  env = env || {}

  // Merge development server and devtool to renderer configuration when necessary:
  const renderer = Object.assign(
    {},
    webapp(env, argv),
    devtool(env)
  )

  return [renderer]
}

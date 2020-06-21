const path = require('path');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractCSS = new ExtractTextPlugin({
  filename: './bundle.css'// путь в папке build, куда будет помещаться собранный файл
});

module.exports = {
  entry: [
    './src/js/index.js',// основной файл приложения
    './src/styles/style.css',// основной файл приложения
  ],
  output: {
    path: path.resolve(__dirname, "./build"), // путь к каталогу выходных файлов
    filename: 'bundle.js'// название создаваемого файла 
    //filename: './bundle.js'// путь в папке dist, куда будем помещаться собранный файл
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.jsx?$/,// какие файлы обрабатывать
        exclude: /node_modules/, // какие файлы пропускать
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "env"
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
            use: [
              {
                loader: "css-loader",
                options: {
                  sourceMap: true,
                }
              },
            ]
        })
      }
    ]
  },
  plugins: [
    extractCSS
  ],
  devServer: {  // configuration for webpack-dev-server
      contentBase: './build',  //source of static assets
  }
};
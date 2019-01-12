import gulp from "gulp";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import path from "path";
import nodemon from "gulp-nodemon";
import fs from 'fs';
import { execSync } from "child_process";
require('dotenv').config();

const paths = {
  javascript: path.resolve(__dirname, "public/js/"),
  app: path.resolve(__dirname, "src/"),
  server: path.resolve(__dirname, "bin/www")
};

export function bundle() {
  return gulp.src("src/index.js").pipe(
    webpackStream({
      plugins: [
        new webpack.DefinePlugin({"process.env.BUNGIE_CLIENT_ID": process.env.BUNGIE_CLIENT_ID}),
        new webpack.DefinePlugin({"process.env.BUNGIE_API_KEY": JSON.stringify(process.env.BUNGIE_API_KEY)})
      ],
      optimization: {
        minimize: false
      },
      entry: {
        main: ["babel-polyfill", paths.app + "/index.js"]
      },
      output: {
        filename: "bundle.js"
      },
      module: {
        rules: [
          {
            test: /(\.css|.scss)$/,
            use: [
              {
                loader: "style-loader" // creates style nodes from JS strings
              },
              {
                loader: "css-loader" // translates CSS into CommonJS
              }
            ]
          },
          {
            test: /\.(jsx|js)?$/,
            use: [
              {
                loader: "babel-loader"
              }
            ]
          }
        ]
      }
    })
  )
  .pipe(gulp.dest(paths.javascript));
}

export const build = gulp.series(bundle);

export function server() {
  if (process.env.NODE_ENV === 'development') {
    if (!fs.existsSync("key.pem") || !fs.existsSync("cert.pem")) {
      execSync("openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -subj '/CN=www.mydom.com/O=My Company Name LTD./C=US'");
    }
  }

  return nodemon({
    script: paths.server
  })
}

export const serve = gulp.series(build, server);

gulp.watch(['*.js', 'src/**/*.js', 'src/**/*.jsx', 'routes/**/*.js'], build);

export default serve;
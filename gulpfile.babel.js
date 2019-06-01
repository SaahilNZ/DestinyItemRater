import gulp from "gulp";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import path from "path";
import nodemon from "gulp-nodemon";
import fs from 'fs';
import { execSync } from "child_process";
import ts from 'gulp-typescript';
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const paths = {
  // Source
  dataSrc: path.resolve(__dirname, "src/data/"),
  viewsSrc: path.resolve(__dirname, "src/views/"),
  publicSrc: path.resolve(__dirname, "src/public/"),
  app: path.resolve(__dirname, "src/app/"),
  
  // Build
  data: path.resolve(__dirname, "build/data/"),
  public: path.resolve(__dirname, "build/public/"),
  views: path.resolve(__dirname, "build/views/"),

  // Server
  server: path.resolve(__dirname, "bin/www")
};

let tsProject = ts.createProject("tsconfig.json");

export function bundleApp() {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(
      webpackStream({
        plugins: [
          new webpack.DefinePlugin({ "process.env.BUNGIE_CLIENT_ID": process.env.BUNGIE_CLIENT_ID })
        ],
        optimization: {
          minimize: false
        },
        entry: {
          main: ["babel-polyfill", paths.app + "/index.tsx"]
        },
        output: {
          filename: "app.bundle.js"
        },
        devtool: "source-map",
        resolve: {
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
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
            },
            {
              test: /\.tsx?$/,
              use: "awesome-typescript-loader"
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
          ]
        }
      })
    ).pipe(gulp.dest(paths.public));
}

export function copyViews() {
  return gulp.src(path.resolve(paths.viewsSrc, "*.html"))
    .pipe(gulp.dest(paths.views));
}

export function copyManifest() {
  return gulp.src(path.resolve(paths.publicSrc, "manifest.json"))
  .pipe(gulp.dest(paths.public));
}

export function copyFavicon() {
  return gulp.src(path.resolve(paths.publicSrc, "favicon.ico"))
    .pipe(gulp.dest(paths.public));
}
  
export function copyPerkRatings() {
  return gulp.src(path.resolve(paths.dataSrc, "d2-armour-perks.csv"))
    .pipe(gulp.dest(paths.data));
}

export const copyPublicFiles = gulp.parallel(copyFavicon, copyManifest);

export const copyStaticFiles = gulp.parallel(copyViews, copyPublicFiles, copyPerkRatings);

export const build = gulp.parallel(bundleApp, copyStaticFiles);

export function server() {
  console.log(`Production: ${isProduction}`);
  if (!isProduction) {
    if (!fs.existsSync("key.pem") || !fs.existsSync("cert.pem")) {
      console.log('SSL cert is missing - generating one with OpenSSL...');
      execSync('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -subj "/CN=www.mydom.com/O=My Company Name LTD./C=US"');
    }
  }

  nodemon({
    script: paths.server,
    watch: [
      "routes/**/*.js",
      "app.js",
      "bin/www"
    ]
  }).on('restart', files => {
    if (files) {
      let changed = files.map(f => path.basename(f));
      console.log(`Detected changes in '${changed}'. Restarting...`)
    }
  });
  return Promise.resolve();
}

export const serve = gulp.series(build, server);

gulp.watch(['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx', 'routes/**/*.js'], serve);

export default serve;
import gulp from "gulp";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import path from "path";
import nodemon from "gulp-nodemon";
import fs from 'fs';
import { execSync } from "child_process";
import ts from 'gulp-typescript';
// import uglify from 
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const paths = {
  // Source
  dataSrc: path.resolve(__dirname, "src/data/"),
  viewsSrc: path.resolve(__dirname, "src/views/"),
  publicSrc: path.resolve(__dirname, "src/public/"),
  app: path.resolve(__dirname, "src/app/"),
  nodeModulesSrc: path.resolve(__dirname, "node_modules/"),

  // Build
  data: path.resolve(__dirname, "build/data/"),
  public: path.resolve(__dirname, "build/public/"),
  views: path.resolve(__dirname, "build/views/"),
  nodeModules: path.resolve(__dirname, "build/node_modules/"),

  // Server
  serverSrc: path.resolve(__dirname, "src/server.ts"),
  serverBuild: path.resolve(__dirname, "build/"),
  server: path.resolve(__dirname, "build/server.bundle.js")
};

let tsAppProject = ts.createProject("tsconfig.json");
let tsServerProject = ts.createProject("tsconfig_server.json");

export function bundleApp() {
  return tsAppProject.src()
    .pipe(tsAppProject())
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

export function bundleServer() {
  return tsServerProject.src()
    .pipe(tsServerProject())
    .js.pipe(
      webpackStream({
        devtool: "source-map",
        target: "node",
        resolve: {
          extensions: [".ts", ".js"]
        },
        optimization: {
          minimize: false
        },
        entry: {
          main: ["babel-polyfill", paths.serverSrc]
        },
        output: {
          filename: "server.bundle.js"
        },
        node: {
          __dirname: false,
          __filename: false
        },
        module: {
          rules: [
            {
              test: /\.ts?$/,
              use: "awesome-typescript-loader"
            }
          ]
        }
      })
    ).pipe(gulp.dest(paths.serverBuild));
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

export const build = gulp.parallel(bundleApp, bundleServer, copyStaticFiles);

export function server() {
  process.chdir("./build");
  console.log(`Production: ${isProduction}`);
  if (!isProduction) {
    if (!fs.existsSync("key.pem") || !fs.existsSync("cert.pem")) {
      console.log('SSL cert is missing - generating one with OpenSSL...');
      execSync('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -subj "/CN=www.mydom.com/O=My Company Name LTD./C=US"');
    }
  }

  nodemon({
    script: path.resolve('../', paths.server),
    watch: [
      "server.bundle.js",
    ]
  }).on('restart', files => {
    if (files) {
      let changed = files.map(f => path.basename(f));
      console.log(`Detected changes in '${changed}'. Restarting...`);
    }
  });
  return Promise.resolve();
}

export const serve = gulp.series(build, server);

gulp.watch(['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx', 'routes/**/*.js'], serve);

export default serve;
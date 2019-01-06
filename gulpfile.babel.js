import gulp from "gulp";
import webpackStream from "webpack-stream";
import path from "path";
import nodemon from "gulp-nodemon";
import webpack from "webpack";

const paths = {
  javascript: path.resolve(__dirname, "public/js/"),
  app: path.resolve(__dirname, "src/"),
  server: path.resolve(__dirname, "bin/www")
};

export function bundle() {
  return gulp.src("src/index.js").pipe(
    webpackStream({
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
  return nodemon({
    script: paths.server
  })
}

export const serve = gulp.series(build, server);

gulp.watch(['*.js', 'src/**/*.js', 'src/**/*.jsx', 'routes/**/*.js'], build);

export default serve;
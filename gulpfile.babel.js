import gulp from "gulp";
import webpack from "webpack-stream";
import path from "path";
import nodemon from "gulp-nodemon";

const paths = {
  javascript: path.resolve(__dirname, "public/js/"),
  app: path.resolve(__dirname, "src/"),
  server: path.resolve(__dirname, "bin/www")
};

export function bundle() {
  return gulp.src("src/index.js").pipe(
    webpack({
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
    script: paths.server,
    tasks: ['build']
  })
}

export const serve = gulp.series(build, server);
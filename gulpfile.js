const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const autoprefixer = require("gulp-autoprefixer");

function styles() {
  return src("app/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function layoutStyles() {
  return src("layout/**.scss")
    .pipe(concat("style.css"))
    .pipe(scss())
    .pipe(dest("layout/css"))
    .pipe(browserSync.stream());
}

function watcher() {
  watch(["app/scss/style.scss"], styles);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

function layoutWatcher() {
  watch(["layout/*.scss"], layoutStyles);
  watch(["layout/*.html"]).on("change", browserSync.reload);
}

function initBrowserSync() {
  browserSync.init({
    server: {
      baseDir: "layout/", // app/
    },
  });
}

function building() {
  return src(["app/css/style.min.css", "app/*.html"], { base: "app" }).pipe(
    dest("dist")
  );
}

function cleanDist() {
  return src("dist").pipe(clean());
}

exports.styles = styles;
exports.watcher = watcher;
exports.browserSync = initBrowserSync;

exports.build = series(cleanDist, building);
// exports.default = parallel(styles, initBrowserSync, watcher);
exports.default = parallel(
  styles,
  layoutStyles,
  initBrowserSync,
  watcher,
  layoutWatcher
);

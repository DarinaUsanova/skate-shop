const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const ghPages = require("gh-pages");
const imagemin = require("gulp-imagemin");

function styles() {
  return src("layout/css/style.scss")
    .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ["last 10 versions"],
          cascade: false,
        }),
      ])
    )
    .pipe(concat("style.css"))
    .pipe(dest("layout/css"))
    .pipe(browserSync.stream());
}

function layoutStyles() {
  return src("layout/**/*.scss")
    .pipe(scss().on("error", scss.logError))
    .pipe(concat("style.css"))
    .pipe(dest("layout/css"))
    .pipe(browserSync.stream());
}

function images() {
  return src("layout/images/**/*").pipe(imagemin()).pipe(dest("dist/images"));
}

function watcher() {
  watch(["layout/css/**/*.scss"], styles);
  watch(["layout/images/**/*"], images);
  watch(["layout/*.html"]).on("change", browserSync.reload);
}

function layoutWatcher() {
  watch(["layout/**/*.scss"], layoutStyles);
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
  return src(["layout/css/style.css", "layout/*.html", "layout/images/**/*"], {
    base: "layout",
  }).pipe(dest("dist"));
}

function cleanDist() {
  return src("dist", { allowEmpty: true }).pipe(clean());
}

function deploy(done) {
  ghPages.publish("dist", done);
}

exports.styles = styles;
exports.images = images;
exports.watcher = watcher;
exports.browserSync = initBrowserSync;

exports.build = series(cleanDist, parallel(building, images));
exports.deploy = series(cleanDist, parallel(building, images), deploy);
exports.default = parallel(
  styles,
  layoutStyles,
  initBrowserSync,
  watcher,
  layoutWatcher
);

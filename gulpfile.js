const gulp = require('gulp')
const gulpClean = require('gulp-clean')
// 生成demo
function cleanWxaDemo() {
  return gulp.src('wxa_demo/dist', {read: false, allowEmpty: true}).pipe(gulpClean())
}

function buildWxaDemo() {
  return gulp.src('src/**/*').pipe(gulp.dest('wxa_demo/dist/'))
}
exports.demo = gulp.series(cleanWxaDemo, buildWxaDemo)


// 生成dist
function cleanDist() {
  return gulp.src('dist', {read: false, allowEmpty: true}).pipe(gulpClean())
}
function buildDist() {
  return gulp.src('src/**/*').pipe(gulp.dest('dist/'))
}
  
exports.build = gulp.series(cleanDist, buildDist)

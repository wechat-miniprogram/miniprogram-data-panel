const gulp = require('gulp')
const gulpClean = require('gulp-clean')

function cleanWxaDemo() {
  return gulp.src('wxa_demo/dist', {read: false}).pipe(gulpClean())
}

function buildWxaDemo() {
  return gulp.src('src/**/*').pipe(gulp.dest('wxa_demo/dist/'))
}
  
exports.demo = gulp.series(cleanWxaDemo, buildWxaDemo)


var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');

gulp.task('less', function () {
    return gulp.src(['less/[!@]*.less'])
        .pipe(less())
        .pipe(gulp.dest('css'))
});
gulp.task('build', gulp.series('less', function () {
    return gulp.src('css/**/*.css')
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist'))
}));
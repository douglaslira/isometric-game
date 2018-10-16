var gulp            = require('gulp');
var browserSync     = require('browser-sync');
var reload          = browserSync.reload;
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins         = gulpLoadPlugins();

gulp.task('browser-sync', function() {
    var files = ['build/index.html', 'build/js', 'build/css'];
    browserSync.init(files, {
        server: {
            baseDir: "build"
        }
    });
});

gulp.task('copy', function() {
    gulp.src(['app/assets/**/*']).pipe(gulp.dest('build/assets'));
});

gulp.task('sass', function () {
    return gulp.src('app/sass/*.scss')
        .pipe(plugins.plumber())
        .pipe(plugins.sass())
        .on('error', function (err) {
            plugins.gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer({
            browsers: [
                '> 1%',
                'last 2 versions',
                'firefox >= 4',
                'safari 7',
                'safari 8',
                'IE 8',
                'IE 9',
                'IE 10',
                'IE 11'
            ],
            cascade: false
        }))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest('build/css')).on('error', plugins.util.log)
        .pipe(reload({stream:true}));
});

gulp.task('usemin', function() {
    gulp.src('app/*.html').pipe(plugins.usemin()).pipe(gulp.dest('build'));
});

gulp.task('usemin-build', function() {
    gulp.src('app/*.html').pipe(plugins.usemin({
        js: [plugins.uglify()]
    })).pipe(gulp.dest('build'));
});

gulp.task('jshint', function() {
    return gulp.src('app/**/*.js').pipe(plugins.jshint());
});

gulp.task('scripts', function() {
    return gulp.src([
        'app/js/state/**/*.js',
        'app/js/app.js'
    ])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.concat('scripts.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('scripts-build', function() {
    return gulp.src([
        'app/js/state/**/*.js',
        'app/js/app.js'
    ])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.concat('script.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('default', ['copy', 'sass', 'scripts', 'usemin', 'browser-sync'], function () {
    gulp.watch("app/sass/**/*.scss", ['sass']);
    gulp.watch("app/index.html", ['usemin']);
    gulp.watch([
        'app/js/**/*.js',
        'app/js/app.js'
    ], ['scripts']);
});

gulp.task('build', ['copy', 'sass', 'scripts-build', 'usemin-build']);

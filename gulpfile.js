/*! Gulpie | MIT License | github.com/designkai/Gulpie */

// Load plugins
var gulp = require('gulp'),
    // For browser prefixing CSS
    autoprefixer = require('gulp-autoprefixer'),
    // Live reloading localhost
    browserSync = require('browser-sync'),
    // Merge JS into one file
    concat = require('gulp-concat'),
    // Super minify CSS
    cssnano = require('cssnano'),
    // Delete files and folders
    del = require('del'),
    // Transfer files with FTP
    ftp = require('vinyl-ftp'),
    // Pipe actions conditionally
    gulpif = require('gulp-if'),
    // Perform gulp tasks in explicit sequences
    gulpsequence = require('gulp-sequence').use(gulp),
    // Gulp utilities
    gutil = require('gulp-util'),
    // Compress images
    imagemin = require('gulp-imagemin'),
    // Compile Jade
    jade = require('gulp-jade'),
    // Compile LESS
    less = require('gulp-less'),
    // Create navite notification
    notify = require('gulp-notify'),
    // IE8 opacity fallbacl
    opacity = require('postcss-opacity'),
    // Pixel fallback for rems
    pixrem = require('pixrem'),
    // Prevent watch from stopping on errors
    plumber = require('gulp-plumber'),
    // Precompile CSS
    postcss = require('gulp-postcss'),
    // Hex fallback for rgba colours
    rgbaFallback = require('postcss-color-rgba-fallback'),
    // Compile SASS
    sass = require('gulp-sass'),
    // Create CSS sourcemaps
    sourcemaps = require('gulp-sourcemaps'),
    // Minify JS
    uglify = require('gulp-uglify');

// Define which plugins should be used as part of PostCSS
var postCssPlugins = [
    rgbaFallback,
    opacity,
    pixrem
];

// Only use nano in production, it's slow
var nano = false;

// Starts localhost
gulp.task('local', function() {
    browserSync({
        server: { baseDir: "dist/" },
        // Makes sure it opens in Chrome, regardless of default browser
        browser: "google chrome",
        notify: false
    });
});

// Images
gulp.task('images', function() {
    gulp.src(['src/images/**/*', '!src/**/*.md'])
        // Prevent breaks from errors
        .pipe(plumber())
        // Compress images
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
        // Send OSX complete notification
        .pipe(notify({ message: '"images" complete' }));
});

// Javascripts
gulp.task('scripts', function() {
    return gulp.src('src/scripts/**/*.js')
        // Prevent breaks from errors
        .pipe(plumber())
        // Filename of compressed JS
        .pipe(concat('main.js'))
        // Minify
        .pipe(uglify())
        // Catch errors
        .on('error', gutil.log)
        .pipe(gulp.dest('dist/scripts'))
        // Send OSX complete notification
        .pipe(notify({ message: '"scripts" complete' }))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}));
});

// SCSS
gulp.task('scss', function() {
    // Turn on CSSnano if true
    if (nano) {postCssPlugins.push(cssnano);}
    return gulp.src('src/styles/*.scss')
        // Prevent breaks from errors
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', function(err){
            gutil.log(err);
            this.emit('end');
        }))
        // Send OSX error notification
        .on("error", notify.onError(function (error) {
            return '"scss" error: ' + error.message;
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(postcss(postCssPlugins))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/styles'))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}))
        // Send OSX complete notification
        .pipe(notify({ message: '"scss" complete' }));
});

// LESS
gulp.task('less', function() {
    // Turn on CSSnano if true
    if (nano) {postCssPlugins.push(cssnano);}
    return gulp.src('src/styles/*.less')
        // Prevent breaks from errors
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function(err){
            gutil.log(err);
            this.emit('end');
        }))
        // Send OSX error notification
        .on("error", notify.onError(function (error) {
            return '"less" error: ' + error.message;
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(postcss(postCssPlugins))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/styles'))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}))
        // Send OSX complete notification
        .pipe(notify({ message: '"less" complete' }));
});

// Jade
gulp.task('jade', function() {
    return gulp.src('src/**/*.jade')
        // Prevent breaks from errors
        .pipe(plumber())
        .pipe(jade())
        // Send OSX error notification
        .on("error", notify.onError(function (error) {
            return '"jade" error: ' + error.message;
        }))
        .pipe(gulp.dest('dist'))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}))
        // Send OSX complete notification
        .pipe(notify({ message: '"jade" complete' }));
});

// Move all files into dist
gulp.task('dist', function() {
    // Move all top-level files, HTML files, hidden files and fonts
    gulp.src(['src/*', 'src/**/*.html', 'src/.*', 'src/fonts/**/*', '!src/**/*.jade'])
        // Prevent breaks from errors
        .pipe(plumber())
        .pipe(gulp.dest('dist'))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}))
        // Send OSX complete notification
        .pipe(notify({ message: '"dist" complete' }));
});

// Same as dist, but HTML specific
gulp.task('html', function() {
    // Move all HTML files
    gulp.src('src/**/*.html')
        // Prevent breaks from errors
        .pipe(plumber())
        .pipe(gulp.dest('dist'))
        // Refresh BrowserSync
        .pipe(browserSync.reload({stream: true}))
        // Send OSX complete notification
        .pipe(notify({ message: '"html" complete' }));
});

// Start the localhost and watch everything
gulp.task('default', function(cb) {
    gulpsequence('images', 'scripts', 'scss', 'less', 'jade', 'dist', 'local')(cb);
    gulp.watch('src/images/**', ['images']);
    gulp.watch('src/scripts/**', ['scripts']);
    gulp.watch('src/styles/**/*.scss', ['scss']);
    gulp.watch('src/styles/**/*.less', ['less']);
    gulp.watch('src/**/*.jade', ['jade']);
    gulp.watch('src/**/*.html', ['html']);
});

// Delete the dist/ folder
gulp.task('clean', function() {
    return del('dist');
});

// Cleans dist and rebuilds it
gulp.task('build', function(cb) {
    // Compress CSS for deploy
    nano = true;
    gulpsequence('clean', 'images', 'scripts', 'scss', 'less', 'jade', 'dist')(cb);
});

// Deploy files with FTP (this doesn't clean before running)
gulp.task('deploy', function () {
    // Username and password are mapped to an environment variable. They can be defined with:
    // FTP_USER=username FTP_PWD=password gulp deploy
    // This prevents credentials ever being committed to a repo
    var conn = ftp.create( {
        host: 'ftp.server.com',
        user: process.env.FTP_USER,
        password: process.env.FTP_PWD,
        parallel: 3,
        log: gutil.log
    } );

    // A list of all the folders you'd like to upload
    var globs = [
        'dist/**',
        'dist/*.html'
    ];

    return gulp.src( globs, {
        // Prevents uploading with the dist/ folder included
        base: 'dist/',
        buffer: false } )
        .pipe( conn.newerOrDifferentSize( '/public_html/project' ) ) // only upload newer or different size files
        .pipe( conn.dest( '/public_html/project' )
    );
});

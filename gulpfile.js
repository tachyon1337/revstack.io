
///variables ////////////////////////////////////////////
var gulp=require('gulp'),
    http = require('http'),
    ecstatic = require('elliptical-ecstatic'),
    tasks=require('elliptical-gulp'),
    sass = require('gulp-sass'),
    liveServer = require("live-server"),
    watch=require('gulp-watch'),
    fs = require('fs-extra'),
    config=require('./config.json');


//////// public tasks //////////////////////////////////////
gulp.task('default',function(){
    console.log('echo revstack.io');
});

///---app setup---///
gulp.task('init',function(){
    if (!fs.existsSync('./public')) {
        copyTasks();
    }else{
        console.log('app setup has already been run');
    }

});

///---start---///
gulp.task('start',function(){

    //start server
    var path=config.path;
    path=path.replace('.','');
    startEcstaticServer({
        port:config.port,
        path:path
    });

    tasks.scripts({
        src:config.src,
        dest:config.dest,
        destFile:config.destFile
    });

    var src='./sass/**/*.scss';
    watch(src,function(files){
        compileSass();
    });
});

///---start live---///
gulp.task('start-live',function(){

    //start server
    startLiveServer({
        port:config.livePort,
        path:config.path,
        host:config.liveHost
    });

    tasks.scripts({
        src:config.src,
        dest:config.dest,
        destFile:config.destFile
    });

    var src='./sass/**/*.scss';
    watch(src,function(files){
        compileSass();
    });

});

///--sass--///
gulp.task('sass', function () {
    compileSass(config.path);
});

///---sass watch---///
gulp.task('sass-watch', function () {
    var src = './sass/**/*.scss';
    watch(src, function (files) {
        compileSass();
    });
});


gulp.task('build', function () {
    copyScripts();
});



/////// private methods ////////////////////////////
function testInit(){

}

function copyTasks(){
    copyAppJsFiles();
    copyAppSassFiles();
    copyPublicBundlesFiles();
    copyPublicComponents();
    copyPublicCssFiles();
    copyPublicImages();
    copyPublicScripts();
    copyPublicViews();
    copyPublicIndexFile();
    copyEllipticalBundle();
    copyEllipticalScripts();
    copyUIComponents();
    copyMdComponents();
    copyPaperComponents();
    copyFonts();
    copyIcons();
    copyAppCss();
    copyAppJs();
    copyAppSass();
    console.log('app init complete');
    console.log('please run bower install to complete setup');
}

function copyAppJsFiles(){
    gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./app/'));
}

function copyAppSassFiles(){
    gulp.src('./src/sass/**/*.*')
        .pipe(gulp.dest('./sass/'));
}

function copyPublicBundlesFiles(){
    gulp.src('./src/bundles/**/*.*')
        .pipe(gulp.dest('./public/bundles/'));
}

function copyPublicComponents(){
    gulp.src('./src/components/**/*.*')
        .pipe(gulp.dest('./public/components/'));
}

function copyPublicCssFiles(){
    gulp.src('./src/css/**/*.*')
        .pipe(gulp.dest('./public/css/'));
}

function copyPublicImages(){
    gulp.src('./src/images/**/*.*')
        .pipe(gulp.dest('./public/images/'));
}

function copyPublicScripts(){
    gulp.src('./src/scripts/**/*.*')
        .pipe(gulp.dest('./public/scripts/'));
}

function copyPublicViews(){
    gulp.src('./src/html/views/**/*.*')
        .pipe(gulp.dest('./public/views/'));
}

function copyPublicIndexFile(){
    gulp.src('./src/html/index.html')
        .pipe(gulp.dest('./public/'));
}

function copyEllipticalBundle(){
    gulp.src('./node_modules/elliptical-bundle/dist/bundle.html')
        .pipe(gulp.dest('./public/bundles/'));
}

function copyEllipticalScripts(){
    gulp.src('./node_modules/elliptical-bundle/dist/scripts/**/*.js')
        .pipe(gulp.dest('./public/scripts/'));
}

function copyUIComponents(){
    gulp.src('./node_modules/elliptical-ui-components/dist/ui/**/*.*')
        .pipe(gulp.dest('./public/components/ui/'));
}

function copyMdComponents(){
    gulp.src('./node_modules/md-components/dist/md/**/*.*')
        .pipe(gulp.dest('./public/components/md/'));
}

function copyPaperComponents(){
    gulp.src('./node_modules/paper-components/dist/paper/**/*.*')
        .pipe(gulp.dest('./public/components/paper/'));
}

function copyFonts(){
    gulp.src('./node_modules/material-design-font/dist/fonts/**/*.*')
        .pipe(gulp.dest('./public/css/fonts/'));
}

function copyIcons(){
    gulp.src('./node_modules/material-design-icons/dist/fonts/**/*.*')
        .pipe(gulp.dest('./public/css/fonts/'));
}

function copyAppCss(){
    gulp.src('./src/bin/app.css')
        .pipe(gulp.dest('./public/css/'));
}

function copyAppJs(){
    gulp.src('./src/bin/app.js')
        .pipe(gulp.dest('./public/scripts/'));
}

function copyAppSass(){
    gulp.src('./src/bin/app.scss')
        .pipe(gulp.dest('./'));
}




function startLiveServer(opts){
    var params={
        port:opts.port,
        host:opts.host,
        root:opts.path,
        noBrowser:true
    };
    liveServer.start(params);
}

function startEcstaticServer(opts){
    var path=__dirname + opts.path;
    console.log(path);
    http.createServer(
        ecstatic({ root: path })
    ).listen(opts.port);
}

function compileSass(){
    gulp.src('./app.scss')
        .pipe(sass())
        .pipe(gulp.dest(config.path + '/css'));
}

function copyScripts(){
    gulp.src('node_modules/elliptical-bundle/*.js')
        .pipe(gulp.dest(config.path + '/scripts/'));
}

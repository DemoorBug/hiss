var gulp = require('gulp');
var rev = require('gulp-rev');  // 给每个文件计算 哈希码 然后把文件更改掉
var revReplace = require('gulp-rev-replace'); // 文件名改变 index引用则改变
var useref = require('gulp-useref'); //注释 怎样的合并方式
var filter = require('gulp-filter'); //可以把JS文件筛选出来做一些压缩，然后再放回去
var uglify = require('gulp-uglify'); //比较出名的 压缩 js代码插件
var csso = require('gulp-csso'); // 就是压缩CSS的一个插件
var less = require('gulp-less');  //less
var path = require('path');  //路径
var sourcemaps = require('gulp-sourcemaps'); //-添加map文件
var watch = require('gulp-watch'); //监听文件变化
var autoprefixer = require('gulp-autoprefixer'); //- 添加兼容前缀
var spritesmith = require('gulp.spritesmith'); //雪碧图
var browserSync = require('browser-sync').create(); //服务器
var reload = browserSync.reload; // 重启服务



var _html = './src/index.html', //需要处理的html文件
    _scssArr = ['./src/less/*.less'], //需要处理的less数组
    _imgArr = ['./src/img/*.png'], //需要处理的img数组

    _cssDistDir = 'src/css', //发布的css目录
    _cssMapsDir = 'src/css/map'; // 发布的cssMaps目录


// 静态服务器 并且监听HTML、less变化刷新浏览器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
    gulp.watch(_scssArr, ['less']);
    gulp.watch(["src/*.html","src/less/*.less"]).on('change', function(){
        setTimeout(function(){
            reload();
        },200)
    });
});

// less 处理
gulp.task('less', function () {
  return gulp.src('./src/less/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      // paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer()) //- 添加兼容性前缀
    .pipe(sourcemaps.write(path.relative(_cssDistDir, _cssMapsDir), {
      sourceMappingURL: function(file) {
        return './map/' + file.relative + '.map';
      }
    })) //- maps另存
    .pipe(gulp.dest(_cssDistDir));

});

// css雪碧图，生成的雪碧图和对应的css，需手动替换
gulp.task('sprite', function() {
  var spriteData = gulp.src(_imgArr)
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css'
    }));
  return spriteData.pipe(gulp.dest('dist/sprite/'));
});

// 发布任务，
gulp.task('default',function() {
    var jsFilter = filter('**/*.js', {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});
    var indexHtmlFilter = filter(['**/*','!**/*.html'], {restore: true});

    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso())
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe(rev())
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace())
        .pipe(gulp.dest('dist'));
})



// <!-- build:css css/combined.css -->
// <!-- endbuild -->
//
// <!-- build:js scripts/combined.js -->
// <!-- endbuild -->



// var md5 = require("gulp-md5-plus"); //md5去缓存（修改了源码）
// // 和我那个有异曲同工之妙
// gulp.task('webpackTask',  function() {
//   gulp.src('./src/js/js.js')
//     .pipe(md5(10, _html)) //处理html引用加入md5去缓存
//     .pipe(gulp.dest(_cssDistDir))
// });

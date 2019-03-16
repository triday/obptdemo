var gulp = require('gulp'),
    bump = require('gulp-bump'),
    process = require('child_process'),
    logger = require('gulplog'),
    fs = require('fs');

function runCommand(line) {
    return new Promise(function (resolve, reject) {
        process.exec(line, (error, stdout, stderr) => {
            if (error) reject(error);
            stdout = (stdout || '').trim();
            stderr = (stderr || '').trim();
            stdout && logger.info(stdout);
            stderr && logger.error(stderr);
            resolve(stdout)
        });
    });
}

function runCommands(lines) {
    return (lines || []).reduce((prev, current) => {
        return prev.then(() => runCommand(current))
    }, Promise.resolve())
}


function incVersion(importance) {
    return gulp.src(['./package.json'])
        .pipe(bump({
            type: importance
        }))
        .pipe(gulp.dest('./'));
}

gulp.task('check-branch', function () {
    return runCommand('git rev-parse --abbrev-ref HEAD')
        .then((branch) => {
            let trimbranch = branch.trim();
            if (trimbranch !== 'master') {
                throw new Error('Only support in master branch.')
            } else {
                logger.info(`The current branch is ${trimbranch} , check branch OK.`)
            }
        });
});

gulp.task('inc-patch', gulp.series('check-branch', function () {
    return incVersion('patch');
}));
gulp.task('inc-feature', gulp.series('check-branch', function () {
    return incVersion('feature');
}));
gulp.task('inc-release', gulp.series('check-branch', function () {
    return incVersion('release');
}));



//gulp patch     # makes v0.1.0 → v0.1.1
gulp.task('npm-publish', function () {
    return runCommand('npm publish');
})


gulp.task('save-change', function () {
    return runCommands([
        'git commit -m "Bumped version number" -a',
        'git push origin master'
    ]);
})


gulp.task('create-new-tag', function (cb) {
    var version = getPackageJsonVersion();
    return runCommands([
        `git tag -a v${version} -m v${version}`,
        'git push origin master --tags'
    ]);

    function getPackageJsonVersion() {
        // 这里我们直接解析 json 文件而不是使用 require，这是因为 require 会缓存多次调用，这会导致版本号不会被更新掉
        return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
    };
});



gulp.task('publish-patch', gulp.series('build', 'inc-patch', 'save-change', 'create-new-tag', 'npm-publish', function () {
    return Promise.resolve();
}));

gulp.task('publish-feature', gulp.series('build', 'inc-feature', 'save-change', 'create-new-tag', 'npm-publish', function () {
    return Promise.resolve();
}));

gulp.task('publish-release', gulp.series('build', 'inc-release', 'save-change', 'create-new-tag', 'npm-publish', function () {
    return Promise.resolve();
}));
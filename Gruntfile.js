module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      conf: grunt.file.readJSON('config.json'),
      //Trying for storing variables else where,
      connect: {
        server: {
          options: {
              port: '<%= conf.port %>',
              // keepalive: true, keeping grunt running
              livereload:true,
              base: './app/',
              open: {
                  target: 'http://localhost:<%= conf.port %>',
                  appName: 'Google Chrome',
              }
          }
        }
      },
      watch: {
          html: {
              files: ['app/index.html'],
              options: {
                  livereload: true
              }
          }
      }
    });

    //Connect plugin
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Open plugin
    grunt.loadNpmTasks('grunt-open');

    //Watch files for reload
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['connect','watch']);

    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};
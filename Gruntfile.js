module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      conf: grunt.file.readJSON('config.json'),
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
            files: ['app/**/*.html'],
            options: {
              livereload: true
            }
        },
        js: {
          files: ['app/**/*.js'],
          options: {
            livereload:true
          }
        },
        bower:{
          files:['bower.json'],
          // tasks:['wiredep']
        }
      },
      wiredep: {
        task: {
          src: ['app/index.html'],
          // options:{
          //   fileTypes:{
          //     fileExtension:{
          //       replace:{
          //         anotherTypeOfBowerFile: function (filePath) {
          //           return '<script src="asdf' + filePath + '"></script>';
          //         }
          //       }
          //     }
          //   }
          // }
        }
      }
    });

    //Connect plugin
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Open plugin
    grunt.loadNpmTasks('grunt-open');

    //Watch files for reload
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.loadNpmTasks('grunt-wiredep');


    // Default task(s).
    grunt.registerTask('default', ['connect','watch']);

    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};
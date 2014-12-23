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
      },
      bump:{
        options:{
          files:['package.json', 'bower.json'],
          updateConfigs:['pkg'],
          commit:true,
          commitMessage:'[RELEASE] Release v%VERSION%',
          commitFiles:[],
          createTag:true,
          tagName:'v%VERSION%',
          push:true,
          pushTo:'upstream',
          gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
          globalReplace: false
        }
      },
       ngconstant: {
        stage:{
          options: {
            name: 'pyroApp.config',
            dest: './app/app-config.js',
            constants: {
              version: "<%= pkg.version %>",
              SERVERURL: "localhost:4000/staging/"
            }
            // ,
            // values: {
            //   debug: false
            // }
          }
        },
        release:{
          options: {
            name: 'pyroApp.config',
            dest: './app/app-config.js',
            constants: {
              version: "<%= pkg.version %>",
              SERVERURL: "https://pyro-server.herokuapp.com/<%= pkg.version %>/"
            }
          }
        }
      },
      shell:{
        deploy:{
          command:'firebase deploy'
        }
      }
    });

    //Connect plugin
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Open plugin
    grunt.loadNpmTasks('grunt-open');

    //Watch files for reload
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Wire dependenceies
    grunt.loadNpmTasks('grunt-wiredep');

    //Auto Versioning
    grunt.loadNpmTasks('grunt-bump');

    //Dynamic generation of angular constants
    grunt.loadNpmTasks('grunt-ng-constant');

    //Run shell commands (Firebase deploy)
    grunt.loadNpmTasks('grunt-shell');

    // Default task(s).
    grunt.registerTask('default', ['connect','watch']);

    grunt.registerTask('stage', ['ngconstant:stage']);

    // Relase Task (Update version number then angular constants then deploy)
    grunt.registerTask('release', ['bump:prerelease', 'ngconstant:release',  'shell:deploy']);

    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};
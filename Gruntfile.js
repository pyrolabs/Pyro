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
            base: './<%= conf.devFolder %>/',
            open: {
              target: 'http://localhost:<%= conf.port %>',
              appName: 'Google Chrome',
            }
          }
        }
      },
      watch: {
        html: {
            files: ['<%= conf.devFolder %>/**/*.html'],
            options: {
              livereload: true
            }
        },
        js: {
          files: ['<%= conf.devFolder %>/**/*.js'],
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
          src: ['<%= conf.devFolder %>/index.html'],
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
          commitFiles:['-a'],
          createTag:true,
          tagName:'v%VERSION%',
          push:true,
          pushTo:'origin',
          gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
          globalReplace: false
        }
      },
       ngconstant: {
        stage:{
          options: {
            name: 'pyroApp.config',
            dest: './<%= conf.devFolder %>/app-config.js',
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
            dest: './<%= conf.devFolder %>/app-config.js',
            constants: {
              version: "<%= pkg.version %>",
              SERVERURL: "https://pyro-server.herokuapp.com/<%= pkg.version %>/"
            }
          }
        }
      },
      copy:{
        dist:{
          files:[{expand: true, cwd:'./<%= conf.devFolder %>/', src:'**', dest:'<%= conf.distFolder %>/'}]
        }
      },
      ngAnnotate: {
        options: {
          // Task-specific options go here.
        },
        dist: {
          // Target-specific file lists and/or options go here.
          files:[{expand: true, src:['<%= conf.distFolder %>/**/*.js']}]
        },
      },
      uglify: {
        dist: {
          files: [
            {expand:true, cwd:'<%= conf.distFolder %>/components', src:'**/*.js', dest:'<%= conf.distFolder %>/components'},
            {expand:true, cwd:'<%= conf.distFolder %>', src:'*.js', dest:'<%= conf.distFolder %>'},
          ]
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

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Wire dependenceies
    grunt.loadNpmTasks('grunt-wiredep');

    //Auto Versioning
    grunt.loadNpmTasks('grunt-bump');

    //Dynamic generation of angular constants
    grunt.loadNpmTasks('grunt-ng-constant');

    // Handle Angular dependencies (needed for successful minification)
    grunt.loadNpmTasks('grunt-ng-annotate');

    //Run shell commands (Firebase deploy)
    grunt.loadNpmTasks('grunt-shell');

    //Copy files to dist folder for production processing
    grunt.loadNpmTasks('grunt-contrib-copy')

    // Default task(s).
    grunt.registerTask('default', ['connect','watch']);

    grunt.registerTask('stage', ['ngconstant:stage','copy:dist', 'ngAnnotate:dist', 'uglify:dist']);

    // Relase Task (Update version number then angular constants then deploy)
    grunt.registerTask('release', ['bump-only:prerelease', 'ngconstant:release', 'copy:dist', 'ngAnnotate:dist', 'uglify:dist',  'bump-commit', 'shell:deploy']);

    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};

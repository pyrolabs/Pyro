module.exports = function(grunt) {
    // Project configuration.
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      conf: grunt.file.readJSON('config.json'),
      connect: {
        dev: {
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
        },
        dist:{
          options: {
            port: '<%= conf.port %>',
            keepalive: true,
            livereload:true,
            base: './<%= conf.distFolder %>/',
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
        dev:{
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
        stage:{
          options: {
            name: 'pyroApp.config',
            dest: './<%= conf.distFolder %>/app-config.js',
            constants: {
              version: "<%= pkg.version %>",
              SERVERURL: "https://pyro-server.herokuapp.com/<%= pkg.version %>/"
            }
            // ,
            // values: {
            //   debug: false
            // }
          }
        },
        dist:{
          options: {
            name: 'pyroApp.config',
            dest: './<%= conf.distFolder %>/app-config.js',
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
          options:{
            mangle:false
          },
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
      },
      htmlmin: {
        dist: {
          options: {
            removeComments: true,
            collapseWhitespace: true
          },
          files: [
            {expand:true, cwd:'<%= conf.distFolder %>/', src:'index.html', dest:'<%= conf.distFolder %>/'},
            {expand:true, cwd:'<%= conf.distFolder %>/components', src:'**/*.html', dest:'<%= conf.distFolder %>/components'},
            {expand:true, cwd:'<%= conf.distFolder %>/templates', src:'**/*.html', dest:'<%= conf.distFolder %>/templates'}
          ]
        }
      }
    });
    grunt.registerTask('prodFb', function (key, value) {
      var fbFile = "firebase.json"
      var fb = grunt.file.readJSON(fbFile);
      var config = grunt.file.readJSON("config.json");
      fb['firebase'] = config['prodFB'] ;//edit the value of json object, you can also use projec.key if you know what you are updating
      grunt.file.write(fbFile, JSON.stringify(fb, null, 2));//serialize it back to file
    });
    grunt.registerTask('stageFb', function (key, value) {
      var fbFile = "firebase.json"
      var fb = grunt.file.readJSON(fbFile);
      var config = grunt.file.readJSON("config.json");
      fb['firebase'] = config['stageFB'];
      grunt.file.write(fbFile, JSON.stringify(fb, null, 2));
    });
    // Default task(s).
    grunt.registerTask('default', ['ngconstant:dev', 'connect:dev','watch']);

    // Copy files to dist, set config vars for angular, depencency handling, minfication
    grunt.registerTask('build', ['copy:dist','ngconstant:stage', 'ngAnnotate:dist', 'uglify:dist', 'htmlmin:dist']);

    // Build and serve dist folder
    grunt.registerTask('test', ['build', 'connect:dist']);

    grunt.registerTask('stage', ['build', 'stageFb', 'shell:deploy']);

    // Relase Task (Update version number
    grunt.registerTask('release', ['build', 'bump-only:prerelease', 'ngconstant:dist','prodFb', 'bump-commit', 'shell:deploy']);

    grunt.registerTask('serve', ['connect'], function() {
        grunt.task.run('connect');
    });
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    conf: grunt.file.readJSON('config.json'),
    pkg: grunt.file.readJSON('package.json'),

    bump: {
      options: {
        commit: true,
        commitFiles: ['-a'],
        commitMessage: '[RELEASE] Release v%VERSION%',
        createTag: true,
        files: ['package.json', 'bower.json'],
        gitDescribeOptions:  '--tags --always --abbrev=1 --dirty=-d',
        globalReplace:  false,
        push: true,
        pushTo: 'origin',
        tagName: 'v%VERSION%',
        updateConfigs: ['pkg']
      }
    },

    connect: {
      dev: {
        options: {
          base: './<%= conf.devFolder %>/',
          // keepalive: true,
          livereload: true,
          open: {
            appName: 'Google Chrome',
            target: 'http://localhost:<%= conf.port %>'
          },
          port: '<%= conf.port %>'
        }
      },
      dist: {
        options: {
          base: './<%= conf.distFolder %>/',
          livereload: true,
          open: {
            appName: 'Google Chrome',
            target: 'http://localhost:<%= conf.port %>'
          },
          port: '<%= conf.port %>'
        }
      }
    },

    copy: {
      dist: {
        files: [
          { expand: true, cwd: './<%= conf.devFolder %>/', src: '**', dest: '<%= conf.distFolder %>/' }
        ]
      },
      img: {
        files: [
          { expand: true, cwd: './assets/images', src: '**', dest: '<%= conf.distFolder %>/images' },
          { expand: true, cwd: './assets/favicon', src: '**', dest: '<%= conf.distFolder %>' }
        ]
      },
      fonts: {
        files: [
          { expand: true, cwd: './bower_components/fontawesome', src: 'fonts/**', dest: '<%= conf.distFolder %>' },
          { expand: true, cwd: './bower_components/bootstrap', src: 'fonts/**', dest: '<%= conf.distFolder %>' },
          { expand: true, cwd: './bower_components/ionicons', src: 'fonts/**', dest: '<%= conf.distFolder %>' },
        ]
      }
    },

    cssmin: {
      options: {
        sourceMap: true,
        shorthandCompacting: true,
        keepSpecialComments: false
      },
      target: {
        files: {
          '<%= conf.distFolder %>/css/<%= pkg.name %>.min.css': [
            'bower_components/font-awesome/css/font-awesome.css',
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/bootstrap-material-design/dist/css/material.css',
            'bower_components/bootstrap-material-design/dist/css/ripples.css',
            'bower_components/angular-tree-control/css/tree-control.css',
            'bower_components/angular-tree-control/css/tree-control-attribute.css',
            'bower_components/ionicons/css/ionicons.min.css',
            'lib/scale-admin/css/animate.css',
            'lib/scale-admin/css/icon.css',
            'lib/scale-admin/css/font.css',
            'lib/scale-admin/css/app.css',
            'lib/firepad/firepad.css',
            '<%= conf.devFolder %>/css/style.css'
          ]
        }
      }
    },

    htmlmin: {
      dist: {
        files: [
          { expand: true, cwd: '<%= conf.distFolder %>/', src: 'index.html', dest: '<%= conf.distFolder %>/' },
          { expand: true, cwd: '<%= conf.distFolder %>/components', src: '**/*.html', dest: '<%= conf.distFolder %>/components' },
          { expand: true, cwd: '<%= conf.distFolder %>/templates', src: '**/*.html', dest: '<%= conf.distFolder %>/templates' }
        ],
        options: {
          collapseWhitespace: true,
          removeComments: true
        }
      }
    },

    ngAnnotate: {
      dist: {
        files:[
          { expand: true, src: ['<%= conf.distFolder %>/**/*.js'] }
        ]
      }
    },

    ngconstant: {
      dist: {
        options: {
          constants: {
            SERVERURL: 'https://pyro-server.herokuapp.com/<%= pkg.version %>/',
            version: '<%= pkg.version %>'
          },
          dest: './<%= conf.devFolder %>/app-config.js',
          name: 'pyroApp.config',
          values: { debug: false }
        }
      },
      local: {
        options: {
         constants: {
           SERVERURL: 'localhost:4000/api/',
           version: '<%= pkg.version %>'
         },
         dest: './<%= conf.devFolder %>/app-config.js',
         name: 'pyroApp.config',
         values: { debug: true }
        }
      },
      stage: {
        options: {
          constants: {
            SERVERURL: 'https://pyro-server.herokuapp.com/staging/',
            version: '<%= pkg.version %>'
          },
          dest: './<%= conf.devFolder %>/app-config.js',
          name: 'pyroApp.config'
        }
      }
    },

    shell: {
      deploy: {
        command: 'firebase deploy'
      }
    },

    uglify: {
      vendor: {
        files: [{
          src: [
            'bower_components/SHA-1/sha1.js',
            'bower_components/aws-sdk/dist/aws-sdk.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/underscore/underscore.js',
            'bower_components/bootstrap/dist/bootstrap.js',
            'bower_components/bootstrap-material-design/dist/material.js',
            'bower_components/bootstrap-material-design/dist/ripples.js',
            'bower_components/firebase/firebase.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angularfire/dist/angularfire.js',
            'bower_components/angular-tree-control/angular-tree-control.js',
            'bower_components/ace-builds/src-noconflict/ace.js',
            'bower_components/angular-ui-ace/ui-ace.js',
            'bower_components/angulartics/dist/angulartics.min.js',
            'bower_components/angulartics/dist/angulartics-ga.min.js',
            '<%= conf.devFolder %>/lib/firepad/firepad.min.js',
            '<%= conf.devFolder %>/lib/timeAgo/timeAgo.js',
            // "//dnzqutlnv2py6.cloudfront.net/library/1.0.0-a.2/pyro.min.js",
            '<%= conf.devFolder %>/cdn/pyroLibrary/pyro.min.js',
            '<%= conf.devFolder %>/cdn/pyroService/pyroService.js',
          ],
          dest: '<%= conf.distFolder %>/vendor.min.js'
        }],
        options: {
          mangle: false,
          compress: false
        }
      },
      dist: {
        files: [
          { expand: true, cwd: '<%= conf.distFolder %>/components', src: '**/*.js', dest: '<%= conf.distFolder %>/components' },
          { expand: true, cwd: '<%= conf.distFolder %>', src: '*.js', dest: '<%= conf.distFolder %>' }
        ],
        options: {
          mangle: false
        }
      }
    },

    watch: {
      css: {
        files: ['<%= conf.devFolder %>/**/*.css'],
        // tasks:['cssmin'],
      },
      html: {
        files: ['<%= conf.devFolder %>/**/*.html'],
        options: { livereload: true }
      },
      js: {
        files: ['<%= conf.devFolder %>/**/*.js'],
        options: { livereload: true }
      }
    },

    wiredep: {
      task: {
        src: ['<%= conf.devFolder %>/index.html']
        // options: { fileTypes: { fileExtension: {
        //   replace: { anotherTypeOfBowerFile: filePath => `<script src=${filePath}></script>` }
        // }}}
      }
    }
  })

  // default
  grunt.registerTask('default', ['start'])

  // build
  grunt.registerTask('build', ['build-dist', 'copy:img', 'copy:fonts', 'build-vendor'])
  grunt.registerTask('build-dist', ['ngconstant:dist', 'copy:dist', 'ngAnnotate:dist', 'uglify:dist', 'htmlmin:dist'])
  grunt.registerTask('build-vendor', ['uglify:vendor'])

  // config
  grunt.registerTask('configProd', () => setFirebaseEnv('prodFB'))
  grunt.registerTask('configStage', () => setFirebaseEnv('stageFB'))

  // develop
  grunt.registerTask('start-dev', ['ngconstant:local', 'connect:dev', 'watch'])
  grunt.registerTask('start-dist', ['ngconstant:dist', 'connect:dist', 'watch'])
  grunt.registerTask('test', ['build','connect:dist'])

  // release
  grunt.registerTask('publish', ['configProd', 'bump-commit', 'shell:deploy'])
  grunt.registerTask('release', ['configProd',  'shell:deploy', 'configStage'])
  grunt.registerTask('stage', ['build', 'configStage', 'shell:deploy'])
  grunt.registerTask('version', ['bump-only:prerelease', 'ngconstant:dev', 'build'])
}

function setFirebaseEnv(value) {
  if (typeof value !== 'string' || (value !== 'prodFB' && value !== 'prodFB')) {
    throw new Error('Incorrect argument')
  }
  const firebaseConfig = grunt.file.readJSON('firebase.json')
  firebaseConfig['firebase'] = conf[value]
  grunt.file.write('firebase.json', JSON.stringify(firebaseConfig, null, 2))
}


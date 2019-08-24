module.exports = function(grunt) {

  'use strict';

  /** PROJECT CONFIGURATION **/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Deletes specified folders, files, etc.
    // npmjs.com/package/grunt-contrib-clean
    clean: {
      files: ['client/js/temp.concat.js']
    },

    // Concatenates specified JS files
    // npmjs.com/package/grunt-contrib-concat
    concat: {
      options: {
        separator: '/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */',
      },

      files: {
        src: [
          'client/js/vendor/jquery.js',
          'client/js/vendor/bootstrap.js',
          'client/js/vendor/knockout-latest.js'
        ],
        dest: 'client/js/temp.concat.js'
      }
    },

    // Starts a connect web server
    // npmjs.com/package/grunt-contrib-connect
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          base: 'client',
          keepalive: true
        }
      }
    },

    // Duplicates files and folders
    // npmjs.com/package/grunt-contrib-copy
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'client/',
          src: 'index.html',
          dest: '../'
        }, {
          expand: true,
          cwd: 'client/assets',
          src: '**',
          dest: '../assets/'
        }, {
          expand: true,
          cwd: 'docs',
          src: '**',
          dest: '../'
        }, {
          expand: true,
          cwd: 'client/fonts/',
          src: '**',
          dest: '../fonts/'
        }],
      },
      init: {
        files: [{
          expand: true,
          cwd: './',
          src: 'node_modules/jquery/dist/jquery.js',
          dest: 'client/js/vendor',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: './',
          src: 'node_modules/bootstrap/dist/css/bootstrap.css',
          dest: 'client/css',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: './',
          src: 'node_modules/bootstrap/dist/css/bootstrap.css.map',
          dest: 'client/css',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: './',
          src: 'node_modules/bootstrap/dist/fonts/**',
          dest: 'client/fonts',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: './',
          src: 'node_modules/bootstrap/dist/js/bootstrap.js',
          dest: 'client/js/vendor',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: './',
          src: 'node_modules/knockout/build/output/knockout-latest.js',
          dest: 'client/js/vendor',
          flatten: true,
          filter: 'isFile'
        }],
      }
    },

    // Checks CSS
    // npmjs.com/package/grunt-contrib-csslint
    // github.com/CSSLint/csslint/wiki
    csslint: {
      strict: {
        options: {
          'import': 2
        },
        src: ['client/css/main.css']
      },
      lax: {
        options: {
          'box-model': false,
          'import': false,
          'important': false,
          'order-alphabetical': false,
          'outline-none': false,
          'ids': false
        },
        src: ['client/css/main.css']
      }
    },

    // Minifies CSS
    // npmjs.com/package/grunt-contrib-cssmin
    cssmin: {
      target: {
        files: {

          // 'outputFile' : ['analyzedFile']
          '../css/styles.min.css': [
            'client/css/bootstrap.css',
            'client/css/main.css'
          ]
        }
      }
    },

    // Minifies HTML code
    // npmjs.com/package/grunt-contrib-htmlmin
    htmlmin: {
      dist: {
        options: {
          removeComments: false,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        },

        files: {

          // 'destinationFile' : 'sourceFile'
          '../index.html': '../index.html'
        }
      }
    },

    // Generates jsdoc documentation
    // https://www.npmjs.com/package/grunt-jsdoc
    jsdoc: {
      dist: {
        src: ['client/js/main.js'],
        options: {
          destination: 'docs/jsdoc'
        }
      }
    },

    // Checks for errors and redundancy in JavaScript code
    // npmjs.com/package/grunt-contrib-jshint
    // jshint.com/docs/options/
    jshint: {
      options: {
        force: true,
        strict: 'global',
        globals: {
          'documnent': true,
          'console': true,
          '$': true,
          'ko': true,
          'google': true
        },
        reporter: require('jshint-stylish')
      },

      files: {
        src: ['client/js/main.js']
      }
    },

    // Applies specified css post-processers
    // npmjs.com/package/grunt-postcss
    postcss: {
      options: {
        map: {
          inline: false,
          annotation: 'client/css'
        },

        processors: [
          require('pixrem')(), // Adds fallbacks for rem units 
          require('autoprefixer')({
            browserlist: 'last 2 versions'
          }) // Adds vendor prefixes 
        ]
      },

      dist: {
        src: 'client/css/*.css'
      }
    },

    // Alters file paths in html file
    // npmjs.com/package/grunt-processhtml
    processhtml: {
      dist: {
        files: {

          // 'outputFile' : ['analyzedFile']
          '../index.html': ['client/index.html']
        }
      }
    },

    // Minifies JS
    // npmjs.com/package/grunt-contrib-uglify
    uglify: {
      options: {
        sourceMap: true
      },

      my_target: {

        // 'outputFile' : ['analyzedFile']
        files: {
          '../js/main.min.js': ['client/js/main.js'],
          '../js/vendor.min.js': ['client/js/temp.concat.js']
        }
      }
    }
  });

  /** DEPENDENT PLUGINS **/
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-processhtml');

  /** CUSTOM TASKS **/
  grunt.registerTask('init', ['copy:init']);
  grunt.registerTask('dev', ['concat', 'jshint', 'csslint:lax', 'clean:files', 'jsdoc']);
  grunt.registerTask('dist', ['concat', 'uglify', 'copy', 'processhtml', 'cssmin', 'htmlmin', 'clean:files']);
};

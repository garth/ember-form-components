module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ember_handlebars: {
      compile: {
        options: {
          processName: function(filename) {
              var name = filename.replace('app/templates/', '');
              console.log(name.substring(0,name.length-4));
              return name.substring(0,name.length-4);
              var fromComponent = filename.substring(filename.lastIndexOf('//')+1,filename.length);
              console.log(fromComponent.substring(0,fromComponent.length-4));
              return fromComponent.substring(0,fromComponent.length-4);
          },
          namespace: "Ember.TEMPLATES"
        },
        files: {
          ".tmp/ember-form-components.js": [
            "app/templates/**/*.hbs"
          ]
        }
      }
    },
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> https://github.com/garth/ember-form-components */\n'
      },
      dist: {
        src:  [
          'app/init.js',
          'app/scripts/components/mixins.js',
          'app/scripts/components/input-text-component.js',
          'app/scripts/components/input-email-component.js',
          'app/scripts/components/input-password-component.js',
          'app/scripts/controllers/form-controller-mixin.js',
          'app/register.js',
          '.tmp/*.js'
        ],
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> https://github.com/garth/ember-form-components */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    clean: ['.tmp']
  });

  // Load the plugins that provides the tasks above:
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ember-handlebars');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s). (The one that is ran when 'grunt' command is called from the directory)
  grunt.registerTask('default', ['ember_handlebars', 'concat', 'uglify', 'clean']);
};

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
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd h:M:s") %> https://github.com/garth/ember-form-components */\n'//,
        // mangle: false,
        // beautify: true,
        // compress: false,
        // preserveComments: true
      },
      build: {
        src:  [
          'app/init.js',
          'app/scripts/components/mixins.js',
          'app/scripts/components/input-text-component.js',
          'app/scripts/components/input-email-component.js',
          'app/scripts/components/input-password-component.js',
          'app/scripts/controllers/form-controller-mixin.js',
          'app/register.js',
          '.tmp/*.js'
        ], //<%= pkg.name %>
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    clean: ['.tmp']
  });

  // Load the plugins that provides the tasks above:
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ember-handlebars');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s). (The one that is ran when 'grunt' command is called from the directory)
  grunt.registerTask('default', ['ember_handlebars', 'uglify', 'clean']);
};

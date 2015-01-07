module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      js: {
        src: 'client/*.js',
        dest: 'client/js/main.js'
      },
    },
    min: {
      js: {
        src: 'client/js/main.js',
        dest: 'client/js/main.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['concat']);
};


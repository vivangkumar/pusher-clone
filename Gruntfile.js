module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        seperator: ';'
      },
      js: {
        src: 'client/*.js',
        dest: 'client/js/main.js'
      },
    },
    uglify: {
      js: {
        src: 'client/js/main.js',
        dest: 'client/js/main.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'uglify']);
};


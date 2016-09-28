module.exports = function(grunt) {

  grunt.initConfig({
      uglify: {
      my_target: {
        files: {
          'client/public/minBundle.js': ['client/public/bundle.js'],
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify')
  

  grunt.registerTask('min', ['uglify']);


  grunt.registerTask('testGrunt', () => {
    console.log('testing grunt!')
  })


}

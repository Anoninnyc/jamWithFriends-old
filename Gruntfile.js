module.exports = function(grunt) {

  grunt.initConfig({
      uglify: {
      my_target: {
        files: {
          'client/public/minBundle.js': ['client/public/bundle.js'],
        }
      }
    },

    shell: {
      addWatchAndDeploy: {
        command: mess => ['webpack','grunt uglify' , 'git add .', 'git commit -m' + mess, 'git push heroku master -f'].join('&&')
      }
      addAndDeploy: {
        command: mess => ['grunt uglify' , 'git add .', 'git commit -m' + mess, 'git push heroku master -f'].join('&&')

      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-shell')
  

  //grunt shell:addAndDeploy:Message_Here

  grunt.registerTask('testGrunt', () => {
    console.log('testing grunt!')
  })


}

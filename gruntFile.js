module.exports = function (grunt) {
    grunt.initConfig({
        embedtemplates: {
            tableAlmightyApp: {
                src: 'src/table-almighty.js',
                dest: '../dist/js/table-almighty.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-angular-template-embedding');
    grunt.registerTask('dev', ['embedtemplates']);
  };
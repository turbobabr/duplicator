module.exports = function(grunt) {

    grunt.initConfig({

        compress: {
            main: {
                options: {
                    archive: 'distr/duplicator.zip',
                    mode: 'zip'
                },
                files: [{ expand: true, src : "../duplicator/**/*", cwd : "" }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['compress']);
};
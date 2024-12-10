module.exports = function(grunt) {
// Gruntfile.js
grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),


    // -------------------------------------
   
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src/js/',
         // themedir: 'path/to/custom/theme/',
          outdir: 'doc/js/'
        }
      }
    }

});

    grunt.loadNpmTasks('grunt-contrib-yuidoc');

     grunt.registerTask('default', [
        "yuidoc"
    ]);
};


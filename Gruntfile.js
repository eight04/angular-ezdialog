module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
		minified: {
			files: {
				"dist/dialog.min.js": "dialog.js"
			},
			options: {
				mangle: true,
				compress: true,
				sourceMap: true,
			}
		}
    },
	less: {
		source: {
			files: {
				"dist/dialog.css": "dialog.less"
			}
		},
		minified: {
			files: {
				"dist/dialog.min.css": "dialog.less"
			},
			options: {
				compress: true,
				sourceMap: true,
				sourceMapFilename: "dist/dialog.min.css.map",
				sourceMapURL: "dialog.min.css.map"
			}
		}
	},
	eslint: {
		source: {
			src: "dialog.js"
		}
	},
	copy: {
		dist: {
			files: {
				"dist/dialog.js": "dialog.js"
			}
		}
	}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ["eslint", 'uglify', "copy", "less"]);

};
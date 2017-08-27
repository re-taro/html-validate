const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('test', ['eslint', 'mochaTest', 'smoketest']);
	grunt.registerTask('build', ['ts', 'test']);
	grunt.registerTask('build:ci', ['ts']); /* CI runs test in separate stage */
	grunt.registerTask('default', ['build']);
	grunt.registerMultiTask('smoketest', smoketest);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			default: {
				options: {
					rootDir: 'src',
				},
				tsconfig: './tsconfig.json',
			},
		},

		eslint: {
			default: [
				'*.js',
				'src/**/*.ts',
			],
		},

		mochaTest: {
			options: {
				require: [
					'ts-node/register',
					'tsconfig-paths/register',
				],
			},
			test: {
				src: [
					'src/**/*.spec.ts',
				],
			},
		},

		smoketest: {
			default: {
				src: 'test-files/rules/*.html',
			},
		},
	});

	function smoketest(){
		this.files.forEach(target => {
			target.src.forEach(filename => {
				const s = path.parse(filename);
				grunt.log.write(`  Testing "${s.name}" .. `);
				const result = spawnSync('./htmllint.js', [
					'--rule', `${s.name}: 2`,
					'--formatter', 'json',
					filename,
				]);

				/* the rule should fail with an error */
				if (result.status === 0){
					grunt.log.error();
					grunt.fatal(`Expected "${s.name}" to report an error`);
				}

				/* validate output */
				const compare = `${s.dir}/${s.name}.json`;
				const expected = fs.readFileSync(compare, {encoding: 'utf-8'});
				const actual = result.stdout.toString('utf-8');
				if (expected !== actual){
					grunt.log.error();
					grunt.log.writeln(`Expected: ${expected}`);
					grunt.log.writeln(`Actual:   ${actual}`);
					grunt.fatal(`Expected "${s.name}" to report correct error`);
				}

				grunt.log.ok();
			});
		});
	}
};

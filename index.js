/* jshint -W106 */
/* jshint -W083 */

var glob = require('glob');
var path = require('path');
var fs = require('fs');

var file;
var files;
var options;
var filePath;
var extension;
var fileStringAbsolute;

var fileObject = {};

var ProcessCSV = require('./lib/ProcessCSV');

function getOptions(optionsObject) {
	var defaultOptions = {
		parserOptions: {
			auto_parse: true
		},
		processValue: function(key, value) {
			if (key !== '') {
				return value;
			}
		}
	};

	if (!optionsObject || typeof optionsObject !== 'object') {
		return defaultOptions;
	}

	for (var option in optionsObject) {
		defaultOptions[options] = optionsObject[option];
	}

	return defaultOptions;
}

function processDir(fileString) {
	fileObject = {};

	if (!fileString || fileString.trim() === '') {
		console.error('Error: no input');
		process.exit(0);
		return;
	}

	// check for wildcards
	if (fileString.indexOf('*') !== -1) {
		fileStringAbsolute = path.resolve(fileString);

		glob(fileStringAbsolute, options, function(error, files) {
			if (error) {
				console.error('Error: could not read files');
				process.exit(0);
				return;
			}

			generateFilePaths(files);
		});
	} else {
		fileStringAbsolute = path.resolve(fileString);

		fs.readdir(fileStringAbsolute, function(error, files) {
			if (error) {
				console.error('Error: could not read files');
				process.exit(0);
				return;
			}

			if (fileStringAbsolute.substr(fileStringAbsolute.length - 1, fileStringAbsolute.length) !== '/') {
				fileStringAbsolute = fileStringAbsolute + '/';
			}

			for (var i = 0; i < files.length; i++) {
				files[i] = fileStringAbsolute + files[i];
			}

			generateFilePaths(files);
		});
	}
}

function generateFilePaths(files) {
	if (files.length === 0) {
		console.error('Error: no files found');
		process.exit(0);
		return;
	}

	for (var i = 0; i < files.length; i++) {
		filePath = files[i];
		extension = path.extname(filePath);
		if (extension === '.csv') {
			fileObject[path.basename(filePath, path.extname(filePath))] = {
				processed: false,
				filePath: filePath
			};
		}
	}

	if (Object.keys(fileObject).length === 0) {
		console.warn('Waring: no files processed');
		process.exit(0);
		return;
	}

	for (var fileID in fileObject) {
		processFileContents(fileObject[fileID].filePath);
	}
}

function processFileContents(filePath, optionsObject) {
	fs.readFile(filePath, 'utf8', function(readError, readFileData) {
		var options = getOptions(optionsObject);

		if (readError) {
			console.error(readError);
			process.exit(0);
			return;
		}

		ProcessCSV.process(readFileData, options, function(processError, processResults) {
			if (processError) {
				console.error(processError);
				process.exit(0);
				return;
			}

			processResults.forEach(function(set) {
				var contents = new Buffer(JSON.stringify(set.data), 'utf8');

				var fileDirectory = path.dirname(filePath);
				var fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));

				fs.writeFile(
					fileDirectory + '/' + fileNameWithoutExtension + '.json',
					contents,
					{
						flag: 'w+',
						encoding: 'utf-8'
					},
					function(writeError) {
						if (writeError) {
							console.error(writeError);
							process.exit(0);
							return;
						}

						var processOperationFinished = true;
						fileObject[fileNameWithoutExtension].processed = true;

						for (var processedfileID in fileObject) {
							if (fileObject[processedfileID] === false) {
								processOperationFinished = false;
							}
						}

						if (processOperationFinished) {
							console.log('Node CSV-JSON: File conversion finished');
							process.exit(0);
							return;
						}
					}
				);
			});
		});
	});
}

module.exports = processDir;

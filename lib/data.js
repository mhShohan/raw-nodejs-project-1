//dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

//base direvtory of data folder
lib.basedir = path.join(__dirname, '/../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
    //open file for writing data
    fs.open(
        `${lib.basedir + dir}/${file}.json`,
        'wx',
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                //convert data to string
                const stringedData = JSON.stringify(data);

                //write data to file , then close it..
                fs.writeFile(fileDescriptor, stringedData, (err1) => {
                    if (!err1) {
                        fs.close(fileDescriptor, (err2) => {
                            if (!err2) {
                                callback('Error was ' + false);
                            } else {
                                callback('Error to closing file!');
                            }
                        });
                    } else {
                        callback('Error to writing new file!');
                    }
                });
            } else {
                callback('Coulld not write the file. It may already Exist...');
            }
        }
    );
};

// Read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

//update existing file
lib.update = (dir, file, data, callback) => {
    //file open for write
    fs.open(
        `${lib.basedir + dir}/${file}.json`,
        'r+',
        (err, fileDescriptor) => {
            if (!err) {
                //convert data to string
                const stringedData = JSON.stringify(data);

                // trancate the file
                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        //Write file and close it
                        fs.writeFile(fileDescriptor, stringedData, (err) => {
                            if (!err) {
                                //close file
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback('File updated Successfully');
                                    } else {
                                        callback(
                                            'Error to close updating file'
                                        );
                                    }
                                });
                            } else {
                                callback('Error to writing updating file');
                            }
                        });
                    } else {
                        callback('Error to truncating file');
                    }
                });
            } else {
                callback('Errod to updating the file, File may not exist!');
            }
        }
    );
};

//Delete the existing file /// Unlink file
lib.delete = (dir, file, callback) => {
    //unlink the file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback('File Deleted Successfully');
        } else {
            callback('Error to deleting file,or may not file exist!');
        }
    });
};
module.exports = lib;

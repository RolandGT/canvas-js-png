exports.hello = function() {
    return 'Hello';
 }

exports.add = function(i, j) {
	return i + j;
};

exports.getImageURL = function() {
    let imageURL = './images/cam3.png';
    return imageURL;
};

exports.getWorkerFileName = function(){
    let workerFileName = 'worker.js';
    return workerFileName;
};


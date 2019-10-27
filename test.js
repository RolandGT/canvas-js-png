const functions = require('./tests/functions');
const assert = require('assert');

describe('Calculator Tests', function() {

    it('returns image url', function(done) {
		assert.equal(functions.getImageURL(), './images/cam3.png');
		// Invoke done when the test is complete.
		done();
    });
    
    it('returns worker file name', function(done) {
		assert.equal(functions.getWorkerFileName(), 'worker.js');
		// Invoke done when the test is complete.
		done();
    });
    
});
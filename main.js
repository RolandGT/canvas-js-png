/**
 * When document is loaded, 'init' function is invoked
 */
document.addEventListener('DOMContentLoaded', init)

/**
 * init function calls initWorker function to check if worker is supported, 
 * if worker is suported initWorker function returns initiated worker
 * then init function invokes analysePNG with worker and image link arguments
 */
function init(){

  let workerFileName,
      initResult,
      worker,
      workerSupported,
      imageURL;
      
  workerFileName = getWorkerFileName(); // function returns string
  initResult = initWorker(workerFileName); // cretates closure
  workerSupported = initResult.supported(); // returns bool
  worker = initResult.worker(); // returns worker or null

  if(workerSupported && worker !== null){
    imageURL = getImageURL(); // gets image url
    //validates if image url is defined and not null
    if(imageURL !== null || imageURL !== 'undefined'){ 
      analysePNG(worker, imageURL);
    }else{
      // in case image can not be found
      console.log('Program stopped: Image not found.');
    }
  }
  
}

/**
 * Function that returns file name that need to be send to worker as argument in init function.'
 * Functionality done for modularity and further development
 * @return {String}      javascript file with code ofr worker
 */
function getWorkerFileName(){
  let workerFileName = 'worker.js';
  return workerFileName;
};

/**
 * Function that returns image URL. Functionality done for modularity and further development
 * @return {String}      image url or path
 */
function getImageURL(){
  let imageURL = './images/cam3.png';
  return imageURL;
};


/**
 * initWorker is a closure that has public properties:
 * 1. to check if worker is supported
 * 2. to access worker 
 * @param  {String} arg1 a worker file name for worker initialization
 * @return {Function}      to check if worker is supported
 * @return {Function}      to access worker
 */
function initWorker(workerFileName){

  let workerSupport,
      worker;

  if (typeof(Worker) !== "undefined") {
    // Web worker supported.
    workerSupport = true;
    worker = new Worker(workerFileName);
  } else {
    // No Web Worker support.
    workerSupport = false;
    worker = null;
  }

  // returns two methods for public access
  return{
    supported : function(){
      return workerSupport;
    },
    worker : function(){
      return worker;
    }
  }

};

/**
 * This function is invoked when document is loaded, worker is initialied and passed as argument
 * @param  {Object} arg1 Initialized Web Worker
 * @param  {String} arg2 image URL
 */
function analysePNG(worker, pImageURL){
  let image,
      ctx;
  let imageURL = pImageURL;
  let canvas = document.getElementById('canvas');

  // checking if canvas is supported
  if (canvas.getContext) {
    // drawing code here
    console.log('canvas in action'); // message that canvas works

    ctx = canvas.getContext('2d'); // getting 2d context
    image = new Image(); //initializing empty image object
    image.src = imageURL; // assigning image URL to the image object

    // when image is loaded
    image.onload = function(){

      var imageWidth = image.width; // image(also canvas) width and height from loaded image
      var imageHeight = image.height;
      canvas.width = imageWidth; //setting canvas dimentions
      canvas.height = imageHeight;
      var tileWidth = imageWidth / 10; // creating 10 by 10 size tiles of the image
      var tileHeight = imageHeight / 10;
      var tilesX = imageWidth / tileWidth; //tie width and height
      var tilesY = imageHeight / tileHeight;
      var totalTiles = tilesX * tilesY; //total tiles , in this case 100    
      var tileData = new Array(); // initiating new empty array for the tiles data
      
      // image needs to be rendered in canvas to access images data
      ctx.drawImage(image, 0,0, imageWidth, imageHeight); 
      
      // itterating throug hole image size in chunks 
      for(var i=0; i < tilesY; i++)
      {
        for(var j=0; j < tilesX; j++) 
        {           
          // Storing the image data of each tile in the array.
          tileData.push(ctx.getImageData(j*tileWidth, i*tileHeight, tileWidth, tileHeight));
        }
      }
      
      // Sending 100 tiles to worker for image color manipulation
      worker.postMessage(tileData);

      // Returning manipulated image data from worker
      worker.onmessage = function(e) {
        
        var manipulatedTiles = e.data; // storing data to local variable
        var tileIterator = 0; // to iterate throught manipulated data array we need to set counter that increments on every tile
        
        // same itteration through image but here the data I am placing data insted of getting
        for(var i=0; i< tilesY; i++)
        {
          for(var j=0; j< tilesX; j++)
          {  
            // Store the image data of each tile in the array.
            ctx.putImageData(manipulatedTiles[tileIterator++], tileWidth*j,tileHeight*i);
          }
        }
      }
    }
  } else {
    // canvas-unsupported code here
    console.log('canvas not supported');
  }
  
};
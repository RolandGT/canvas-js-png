//window.addEventListener("load", init);
document.addEventListener('DOMContentLoaded', init)

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
  return{
    supported : function(){
      return workerSupport;
    },
    worker : function(){
      return worker;
    }
  }
};

function getWorkerFileName(){
  let workerFileName = 'worker.js';
  return workerFileName;
};

function init(){

  let workerFileName,
      initResult,
      worker,
      workerSupported;
      
  workerFileName = getWorkerFileName();
  initResult = initWorker(workerFileName);
  workerSupported = initResult.supported();
  worker = initResult.worker();

  if(workerSupported && worker !== null){
    analysePNG(worker);
  }
  
}


function analysePNG(worker){
  let image,
      canvasData,
      ctx;
  let imageURL = './images/cam.png';
  let canvas = document.getElementById('canvas');

  // checking if canvas is supported
  if (canvas.getContext) {
    // drawing code here
    console.log('canvas in action');

    ctx = canvas.getContext('2d');
    image = new Image();
    image.src = imageURL;

    image.onload = function(){
      var coordinateX = 0;
      var coordinateY = 0;
      var tileY = image.height / 10;
      var tileX = image.width / 10;

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      var tileData = ctx.getImageData(0, 0, 50, 50);
      //Getting the picture
      canvasData = ctx.getImageData(0, 0, canvas.width , canvas.height);
      //console.log(canvasData)
      // Sending Image data to worker
      worker.postMessage(tileData);
      // Returning manipulated image data from worker
      worker.onmessage = function(e) {
        var imageData = e.data; 
        // putting manipulated image data to canvas context
        
        ctx.putImageData(imageData, 0, 0);

      }
    }
    
  } else {
    // canvas-unsupported code here
    console.log('canvas not supported');
  }
  
};

// function workerMessaged(ev){
//   let msg = document.getElementById('msg');
//   let data = ev.data;
//   msg.textContent += data + '\n';
// }

// function workerError(err){
//   console.log(err.message, err.fileName);
// }
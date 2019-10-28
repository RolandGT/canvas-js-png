# Author
<!-- Tables -->
|Name|Email|
|----|-----|
|Rolandas Gedgaudas - T.|rolandas.gt@gmail.com|

# App description

Javascript canvas project for png image color manipulation using web worker.

## App functionalities:
Displays image in canvas, divides it in tiles size 1/10x 1/10 of the image size.
Sends tile data to web worker where tiles color is manipulated:
- If tile has at least 1px with trapnsparency 0 for rgba value a, then all pixels in that tile are colored green.
- Those tiles which all opaque pixels are colored in blue

![image (left) before and result (right) after color manipulation](https://github.com/RolandGT/canvas-js-png/blob/master/images/result.jpg)

## Dependencies

### npm http-server

To start open terminal in folder and write http-server
and then in browser http://127.0.0.1:8080/index.html

### mocha

In package.json file scripts:

```javascript
"scripts": {
    "test": "mocha"
  }
```
to start mocha tests: **npm test**

## Folder Structure

        ├── images
        │   
        ├── tests
        │   └── functions.js
        │   
        ├── index.htm
        ├── style.css
        ├── main.js
        ├── tests.js
        └── worker.js

###  main.js file 
File initializes the code when index.html document is loaded.

```javascript
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
```

It is checked if Web Worer is supported is initiaized with provided file name as argument.

```javascript
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
```

PNG file is devided in tiles and sent to worker,
after returned tiles are combined and put to canvas

```javascript
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
```

### worker.js file
tiles are manipulated

```javascript
self.addEventListener('message', (ev)=>{
    
    // chunks is array with 100 arrays of ImageData
    var chunks = ev.data;
    
    for(var i = 0; i < chunks.length; i++){
       
       //iterate through chunk.data, 
       for(var j = 0, n = chunks[i].data.length; j < n; j += 4) {
        // var red = data[i];
        // var green = data[i + 1];
        // var blue = data[i + 2];
        var alpha = chunks[i].data[j + 3];
        if(alpha === 0){ //if there at least 1 pixel where alpha = 0, make every pixel green color in a tile
            // if chunk has transparent color
            colorGreen(chunks[i].data);
            break;
        }
        else{ // make opacue colors blue
            colorBlue(chunks[i].data);
            break;
        }
      }
    }

    // function that colors tile's every pixel in green color
    function colorGreen(data){
        for(var i = 0, n = chunks[i].data.length; i < n; i += 4) {
            data[i] = 0; // red
            data[i + 1] = 255; // green
            data[i + 2] = 0;// blue
            data[i + 3] = 255; // apha
        };
    };

    // function that colors tile's every pixel in blue color
    function colorBlue(data){
        for(var i = 0, n = chunks[i].data.length; i < n; i += 4) {
            data[i] = 0; // red
            data[i + 1] = 0; // green
            data[i + 2] = 255;// blue
            data[i + 3] = 255; // apha
        };
    };

    //returs chunks array with modified colors
    self.postMessage(chunks)
});
```

## Tests with Mocha
functions.js file in tests folder exports functions.
test.js file in root folder imports functions.js and contains assert tests for some functions.

## CSS
style.css has a stye for canvas border.


self.addEventListener('message', (ev)=>{

    // The Uint8ClampedArray contains height × width × 4 bytes of data, with index values ranging from 0 to (height×width×4)-1.
    // Tile is 1/10 of the image size;
    const imageTile = (ev.data.height * ev.data.width * 4) / 10;
    var data = ev.data.data;
    var i,
        j;

    // find alpha value
    // for(i = 0, j = data.length; i < j ; i +=4) {
    //     if(i > 0 && (i % 4 === 0)){
    //         //if alpha is 0
    //         if(data[i-1] === 0){
    //             data[i+1] = 255; //green
    //             data[i-1]= 255; //alpha
    //         }else{
    //             data[i] = 255; //green
    //             data[i-1]= 255; //alpha
    //         }
    //     }
    // }
    var imageWidth = ev.data.width;
    var imageHeight = ev.data.height;
    // iterate over all pixels
        for(var i = 0, n = data.length; i < n; i += 4) {
          var red = data[i];
          var green = data[i + 1];
          var blue = data[i + 2];
          var alpha = data[i + 3];
          if (alpha === 0){
              alpha = 255;
              data[i + 3] = alpha
          }else{
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 255;
            data[i+3] = 255;
            
          }
        }

    
   
    const imageData = ev.data;
    imageData.data = data;
    self.postMessage(ev.data)
});

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


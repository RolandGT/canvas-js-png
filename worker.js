self.addEventListener('message', (ev)=>{

    // The Uint8ClampedArray contains height × width × 4 bytes of data, with index values ranging from 0 to (height×width×4)-1.
    // Tile is 1/10 of the image size;
    const imageTile = (ev.data.height * ev.data.width * 4) / 10;
    var data = ev.data.data;
    var i,
        j;

    // find alpha value
    for(i = 0, j = data.length; i < j ; i +=4) {
        if(i > 0 && (i % 4 === 0)){
            //if alpha is 0
            if(data[i-1] === 0){
                data[i+1] = 255; //green
                data[i-1]= 255; //alpha
            }else{
                data[i] = 255; //green
                data[i-1]= 255; //alpha
            }
        }
    }
   
    const imageData = ev.data;
    imageData.data = data;
    self.postMessage(ev.data)
});

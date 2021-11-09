let pos = {x:0, y:0};
let canvas, ctx = null;
let frames = []; let frameNo = 0;
let currFrame = -1; 
let cache = null;
let delay = 500;
let width = 5;

function init(){
    canvas = document.getElementById('canvas');
    if (canvas.getContext){
        ctx = canvas.getContext('2d');
        canvas.addEventListener('mousedown', drawOnCanvas)
        canvas.addEventListener('mouseenter', getCoords)
        canvas.addEventListener('mouseout', getCoords)
        canvas.addEventListener('mousemove', drawOnCanvas)
    }
    else
        return;

    clearCanvas();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = '5';
    ctx.lineCap = 'round';

    colorPicker = document.getElementById('color');
    colorPicker.addEventListener('change', changeColor);
    
    widthPicker = document.getElementById('width');
    widthPicker.addEventListener('change', changeWidth);

    capPicker = document.getElementById('cap');
    capPicker.addEventListener('change', changeCap);
}

function changeWidth(width){
    ctx.lineWidth = width;
}

function getCoords(e) {
    let rect = canvas.getBoundingClientRect();
    pos.x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    pos.y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
}

function drawOnCanvas(e){
    if (e.buttons !== 1) 
        return;
    ctx.beginPath();
    if(e.type === 'mousedown')
        getCoords(e);
    ctx.moveTo(pos.x, pos.y);
    getCoords(e);
    ctx.lineTo(pos.x, pos.y); 

    ctx.stroke()
}

function changeColor(){
    ctx.strokeStyle = this.value;
}

function changeWidth(){
    ctx.lineWidth = this.value;
}

function changeCap(){
    ctx.lineCap = this.value;
}

function clearCanvas(){
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function nextFrame(){
    frames[frameNo] = canvas.toDataURL("image/png");
    clearCanvas();
    createPreview();
    frameNo++;
    if(frameNo > 0)
        document.getElementById("import").disabled = false; 
    else
        document.getElementById("import").disabled = true;

}

async function exportToGif(){
    
    if(document.getElementById('include').checked === true)
        nextFrame();
    else{
        if (!confirm('Are you sure you dont want to include this frame?'))
            return;
    }

    if(frames.length === 0 ){
        alert("You have not created any frames.");
        return;
    }

    var encoder = new GIFEncoder();
    encoder.setRepeat(0); 
    encoder.setDelay(delay);
    encoder.setDispose('#ffffff');
    encoder.start();

    for(let i = 0; i < frames.length; i++){
        loadFrame(i, false);
        await addFrameData(encoder);
        clearCanvas();
    }

    encoder.finish();
    encoder.download("download.gif");
}

function addFrameData(encoder){
    return new Promise((resolve,reject)=>{ 
        setTimeout(()=>{
            encoder.addFrame(ctx);
            resolve();
        ;} , 100
        );
    });
}

function deleteFrame(){
    for(i = parseInt(currFrame)+ 1; i < frames.length; i++)
        document.getElementById(i.toString()).id = (i - 1).toString();
    
    frames.splice(currFrame, 1);
    document.getElementById(currFrame).remove();

    frameNo--;
    clearCanvas();
    loadFrame(cache, true)
    regularOverlay();

    if(frameNo > 0)
        document.getElementById("import").disabled = false; 
    else
        document.getElementById("import").disabled = true;
}

function createPreview(){
    const img = document.createElement('img');
    img.src = frames[frameNo]; img.id = frameNo;
    img.classList.add('image-preview');
    img.setAttribute("onclick", "editFrame(this.id)");
    document.getElementById('output').appendChild(img);
}

function newGif(){
    document.getElementById('output').innerHTML = ' ';
    frames = [];
}

function editFrame(imgID){
    currFrame = imgID;
    cache = canvas.toDataURL("image/png");
    editingOverlay(); 
    clearCanvas();
    loadFrame(currFrame, false);
}

function editingOverlay(){
    document.getElementById("finalButtons").innerHTML = 
    "<input  type='button' value='Done Editing' onclick='doneEditing()'>"
    + "<input  class='mx-1' type='button' value='Cancel' onclick='cancelEditing()'>"
    + "<input  type='button' value='Delete Frame' onclick='deleteFrame()'>"
    document.getElementById("checkbox").innerHTML = " ";
}

function updateDelay(value){
    delay = value;
}

function regularOverlay(){
    document.getElementById("finalButtons").innerHTML =
    "<input class='mx-1' type='number' placeholder='ms' onKeyDown='return false' value='500'step='100' min='100' max='10000' id='delay' name='delay' width='50'>"+
    "<input id='newGif' type='button' value='Clear Frames' onclick='newGif()'></input>"+
    "<input class='mx-1' type='button' value='Next Frame' onclick='nextFrame()'>" 
    + "<input type='button' value='Export' onclick='exportToGif()'>"
    document.getElementById("checkbox").innerHTML = "<input type='checkbox' id='include' name='include' >"
    + "<label for='include'>Include Frame</label>"
}

function doneEditing(){
    frames[currFrame] = canvas.toDataURL("image/png");
    
    regularOverlay();
    clearCanvas();
    updatePreview(currFrame)

    loadFrame(cache, true)
}

function updatePreview(id){
    document.getElementById(id).src = frames[id];
}

function cancelEditing(){
    if (confirm('Are you sure you want to cancel?')) {
        regularOverlay();
        clearCanvas();
        loadFrame(cache, true)
    }
}

function loadFrame(frame, isCache){
    let saved = new Image();
    if(isCache === true)
        saved.src = cache;
    else
        saved.src = frames[frame];
    
    saved.onload = function() {
        ctx.drawImage(saved, 0,0);
    } 
}

function importPreviousFrame(){
    loadFrame(parseInt(frameNo)-1, false);
}
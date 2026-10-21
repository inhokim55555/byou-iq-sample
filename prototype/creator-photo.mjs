export function safeProfilePhoto(value){
  return typeof value==='string'&&value.length<=180000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value)?value:null;
}
export async function prepareProfilePhoto(file){
  if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image.');
  if(file.size>10*1024*1024)throw new Error('Choose an image smaller than 10 MB.');
  let image;
  try{image=await createImageBitmap(file);}catch{throw new Error('This image could not be opened. Choose another photo.');}
  try{
    if(!image.width||!image.height||image.width*image.height>40000000)throw new Error('Choose an image smaller than 40 megapixels.');
    // Re-encoding a small thumbnail strips file metadata and avoids remote image tracking.
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const context=canvas.getContext('2d');if(!context)throw new Error('Photo preview is unavailable in this browser.');
    context.fillStyle='#fff';context.fillRect(0,0,256,256);
    const size=Math.min(image.width,image.height);
    context.drawImage(image,(image.width-size)/2,(image.height-size)/2,size,size,0,0,256,256);
    const photo=canvas.toDataURL('image/jpeg',0.85);
    if(!safeProfilePhoto(photo))throw new Error('This photo is too large. Choose a smaller image.');
    return photo;
  }finally{image.close();}
}

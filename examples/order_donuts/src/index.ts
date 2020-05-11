require('./style.css');

export function runApp() {

    console.log('asdf');

document.title = 'YUM DONUTS';
   document.body.innerHTML = `
   
<div class = "container">
   <div class = "item page-title"> YUM DONUTS
      <img src = "https://www.pngitem.com/pimgs/m/375-3758460_file-emojione-f-svg-donut-clipart-png-transparent.png" alt = "Donut" width = "100" height = "100"> 
   </div>
   <div class = "item"> Item 2 </div>
   <div class = "centerElement item">
       
      Enter Your Zip Code <label for = "name"> Street Name</label><br>
      
      <input type = "text" id="name" name ="name"<br>
      
      <select id="name1234">
          <option value="Ioanni_Kapodistria">Ioanni Kapodistria </option>
          <option value="Kentavrou">Kentavrou</option>
      </select>
      
   </div>
   <div class = "item"> Item 4 </div>
</div>
`;
	var i;
	for (i = 0; i < 4; i++){
    	console.log(i);
    	


	
    let value = 0;

    let centerElement: any = document.querySelector('.centerElement');


    let counter = document.createElement('div');
    counter.className = 'blue';
    counter.innerText = value.toString();
    centerElement.appendChild(counter);

    let button = document.createElement('input');
    button.className = 'red';
    button.type = 'button';
    button.value = 'Choose Your Location';
    

    button.addEventListener('click', () => {
        value++;
        counter.innerText = value.toString();
    });

    centerElement.appendChild(button);

}

export const asdf = () => {
    let a = 4

    return a;
}

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
          
      </select>
      
   </div>
   <div class = "item"> Item 4 </div>
</div>
`;
	var i;
	
    	let select = document.querySelector ('#name1234');
    	let names = ['Ioanni Kapodistria', 'Kentavrou', 'Korytsas','Lamprou Katsoni',
    		'Lordou Vyronos', 'Mantos Mavrogenous','Nikitara',
    		'Palaion Patron Germano',	'Petrompei Mavromichali',
    		'Porfyriou Dikaiou'];
    	for (i = 0; i <names.length; i++){
        	console.log(i);
    	}


	
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

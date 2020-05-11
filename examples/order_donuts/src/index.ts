require('./style.css');

export function runApp() {

document.title = 'YUM DONUTS';
   document.body.innerHTML = `<div class = "container">
   				<div class = "item" class> YUM DONUTS </div>
   				<div class = "item"> Item 2 </div>
   				<div id="centerElement" class = "item"> Item 3 </div>
   				<div class = "item"> Item 4 </div>
   				</div>`;

    let value = 0;

    let centerElement: any = document.querySelector('#centerElement');


    let counter = document.createElement('div');
    counter.className = 'blue';
    counter.innerText = value.toString();
    centerElement.appendChild(counter);

    let button = document.createElement('input');
    button.className = 'red';
    button.type = 'button';
    button.value = 'Choose your location';
    

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

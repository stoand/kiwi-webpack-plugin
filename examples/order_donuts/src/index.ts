require('./style.css');

export function runApp() {

document.title = 'YUM DONUTS';
   document.body.innerHTML = `<div class = "container">
   				<div class = "item"> Item 1 </div>
   				<div class = "item"> Item 2 </div>
   				<div class = "item"> Item 3 </div>
   				</div>`;

    let value = 0;


    let counter = document.createElement('div');
    counter.className = 'blue';
    counter.innerText = value.toString();
    document.body.appendChild(counter);

    let button = document.createElement('input');
    button.className = 'red';
    button.type = 'button';
    button.value = 'Choose your location';
    

    button.addEventListener('click', () => {
        value++;
        counter.innerText = value.toString();
    });

    document.body.appendChild(button);

}

export const asdf = () => {
    let a = 4

    return a;
}

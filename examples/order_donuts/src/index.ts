require('./style.css');

document.body.innerHTML = 'todo make awesome app';

let value = 0;

let counter = document.createElement('div');
counter.className = 'blue';
counter.innerText = value.toString();
document.body.appendChild(counter);

let button = document.createElement('input');
button.className = 'red';
button.type = 'button';
button.value = 'Asdf';

button.addEventListener('click', () => {
    value++;
    counter.innerText = value.toString();
});

document.body.appendChild(button);

export const asdf = () => {
    let a = 4 
    
    return a;
}

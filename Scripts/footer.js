

const footer = document.querySelector("footer"); //Creating footer element

injectFooter();
//Footer content


//Append footer to body
 function injectFooter() {
    let footerContent = `<p>@copyright Warona Louw | All rights reserved</p>`;

    footer.innerHTML = footerContent;
 }


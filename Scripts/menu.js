const root = "/Warona Louw_WSOA3029A_Commercial Website";

const menuItems = [
    {name: "Home", href: "index.html"},
    {name: "Theory", href: `Theory/Theory.html`},
    {name: "Designs", href: `Designs/Designs.html`},
    {name: "Data Visualizations", href: `Data Visualizations/Data Visualizations.html`},
]

export function initialise(currentPage) {
    const nav = document.querySelector("header > nav")
    const ul = document.createElement("ul")
    for (let menuItem of menuItems) {
        const li = document.createElement("li")
        if (currentPage != menuItem.name) {
            const a = document.createElement("a")
            a.innerText = menuItem.name
            //creating url string
            let url = `${currentPage === 'Home' ? '':'../'}${menuItem.href}`
            a.setAttribute("href", url)
            li.appendChild(a)
        } else { li.innerText = menuItem.name }
        ul.appendChild(li)
    }
    nav.appendChild(ul)
}
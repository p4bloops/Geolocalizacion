function cargarHTML(url, elementoID) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementoID).innerHTML = data;
  
            if (elementoID === 'nav') {
                const body = document.querySelector("body"),
                    nav = document.querySelector("nav"),
                    modeToggle = document.querySelector(".dark-light"),
                    logoMain = document.querySelector("#logo-main");
  
                let getMode = localStorage.getItem("mode");
                if (getMode && getMode === "dark-mode") {
                    body.classList.add("dark");
                    if (logoMain) logoMain.src = "/img/logo/Logo_v1_oscuro.png";
                } else {
                    if (logoMain) logoMain.src = "/img/logo/Logo_v1_claro.png";
                }
  
                if (modeToggle) {
                    modeToggle.addEventListener("click", () => {
                        modeToggle.classList.toggle("active");
                        body.classList.toggle("dark");
  
                        if (!body.classList.contains("dark")) {
                            localStorage.setItem("mode", "light-mode");
                            if (logoMain) logoMain.src = "/img/logo/Logo_v1_claro.png";
                        } else {
                            localStorage.setItem("mode", "dark-mode");
                            if (logoMain) logoMain.src = "/img/logo/Logo_v1_oscuro.png";
                        }
                    });
                }
  
                body.addEventListener("click", e => {
                    let clickedElm = e.target;
                    if (!clickedElm.classList.contains("menu")) {
                        nav.classList.remove("active");
                    }
                });
            }
        })
        .catch(error => console.error('Error al cargar HTML:', error));
  }
  
  cargarHTML('/Frontend/secciones/nav/nav.html', 'nav');
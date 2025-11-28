
//=========================================================================================
//=========================================================================================

document.getElementById("Start").addEventListener("click", () => {
    Start();
});

//=========================================================================================
//=========================================================================================

let i = "A";

function Start(){
  //i++;
  console.log("Hola Mundo: " + i);
}

//=========================================================================================
//=========================================================================================
//=========================================================================================
//=========================================================================================
//=========================================================================================






function injectCode(fileName, code) {

    const fs = require("fs");
    const path = require("path");

  const filePath = path.join("Scripts", "InjectCode.js");

  // Lee el archivo existente
  let content = fs.readFileSync(filePath, "utf8");

  // Agrega el nuevo código al final
  const newContent = content + "\n\n// ==== Código inyectado automáticamente ====\n" + code + "\n";

  // Escribe el archivo modificado
  fs.writeFileSync(filePath, newContent, "utf8");

  console.log("Código inyectado en:", filePath);
}

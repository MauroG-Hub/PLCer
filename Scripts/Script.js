// ===============================
// CONFIGURACIÓN
// ===============================

// Cambia a false si NO quieres crear un rung al cargar la página
let autoAddFirstRung = true;
// Variable para guardar el Rung actualmente seleccionado
let selectedRung = null;
const rungProperties = [];
const InitialGridAmount = 15;

const WireCells = new Set([
    "WIRE",  // Horizontal Wire
    "CB",    // Close branch
    "OB",    // Open Branch
    "TCB",   // T Close branch
    "TOB",   // T Open Branch
    "TOCB",   // T Open Close Branch
    "VWIRE", // Vertical Wire
    // agrega más tipos de cables o instrucciones que quieras
]);


// ===============================
// EVENTOS
// ===============================

// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {

    // Crear la primera línea si está habilitado
    if (autoAddFirstRung) {
        addRung();
    }

    // Activar botón para agregar rungs
    document.getElementById("AddRungBtn").addEventListener("click", addRung);
});


document.getElementById("AddRungBtn").addEventListener("click", addRung);



function AddInstruction(InstructionName) {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const Instruction = getImageIndexByName(InstructionName);
    const rungCode = selectedRung.querySelector(".RungCode");
    const cells = rungCode.querySelectorAll(".grid-cell");
    const rung = selectedRung;

    const Side = getInstructionSide(FIXED_IMAGE_URLS[Instruction]);
    const propertyName = 'LastInstruction' + Side;

    const cellIndex = AvailableIndex(propertyName, Side);

    const selectedIndex = [...rungCode.children].indexOf(selectedCell);
    const LastWireIndex = findLastWireIndex(cells, selectedIndex, Side);
    
    if (LastWireIndex < 0 || LastWireIndex >= cells.length) { LastWireIndex = 0;}

    const CellInstruction = cells[LastWireIndex].dataset.instruction || "EMPTY";

    const NoShiftInstructions = new Set([...WireCells, "WIRE", "EMPTY", "CB"]);

    if (!NoShiftInstructions.has(CellInstruction)) {
        ShiftToRight(cells, LastWireIndex);
    }

    // Celda a modificar
    const cell = cells[LastWireIndex];

    // Reemplazar imagen correctamente
    replaceGridImage(FIXED_IMAGE_URLS[Instruction], cell);

    // Actualizar propiedades
    rung.properties[propertyName] = LastWireIndex;
}

function findLastWireIndex(cells, selectedIndex, side) {

    // Determinar dirección según side
    const step = side === "Left" ? -1 : side === "Right" ? 1 : 0;

    if (step === 0) {
        console.warn("Side inválido:", side);
        return selectedIndex;
    }

    let index = selectedIndex + step;

    // Si la celda vecina no tiene wire → regresar la celda seleccionada
    if (!cells[index] || cells[index].dataset.instruction !== "WIRE") {
        return selectedIndex;
    }

    // Si sí tiene wire → avanzar mientras siga habiendo wire en ese lado
    while (cells[index] && cells[index].dataset.instruction === "WIRE") {
        index += step;
    }

    // Nos pasamos una posición, regresar una atrás
    return index - step;
}


function findSpareWire(cells, startIndex) {
    let NextWireIndex = -1;
    for (let i = startIndex + 1; i < cells.length; i++) {
        if (cells[i].dataset.instruction === "WIRE") {
            return i;
        }
    }
    return NextWireIndex;
}

function AvailableIndex(propertyName, Side){

    const value = selectedRung.properties?.[propertyName] ?? -1;

    const cellIndex =
        (Side === "Left")  ? value + 1 :
        (Side === "Right") ? value - 1 :
        0;

    return cellIndex;
}


function ShiftToRight(cellsArray, lastWireIndex) {
    // Detectar última celda que contenga un "WIRE" después de lastWireIndex
    const NextSpareWire = findSpareWire(cellsArray, lastWireIndex);
    
    // Si no hay ningún wire después, agregamos columna
    if (NextSpareWire === -1) {
        addColumn(); // agrega una celda por fila al selectedRung
    }

    // Determinar el rango de celdas a mover, ahora incluyendo LastWireIndex
    const EndIndex = NextSpareWire !== -1 ? NextSpareWire : cellsArray.length - 1;

    // Guardar datos de las celdas a desplazar
    const updatedCells = Array.from(cellsArray).slice(lastWireIndex, EndIndex + 1);
    
    // Mover las celdas hacia la derecha empezando desde el final
    for (let i = updatedCells.length - 1; i >= 1; i--) {
        const targetIndex = lastWireIndex + i + 1;
        const OriginIndex = i - 1;
        const nextCell = cellsArray[targetIndex];
        if (!nextCell) continue;

        console.log(updatedCells);
        console.log(targetIndex);
        console.log(OriginIndex);
        console.log(i);
        const imgSrc = updatedCells[i].querySelector("img")?.src ?? null;
        replaceGridImage(imgSrc, nextCell);

        // Mantener dataset
        nextCell.dataset.instruction = updatedCells[i].dataset.instruction ?? "NONE";
    }

    // Limpiar la primera celda del bloque original (LastWireIndex)
    const firstMovedCell = cellsArray[lastWireIndex];
    firstMovedCell.innerHTML = "";
    firstMovedCell.dataset.instruction = "NONE";
}





function replaceGridImage(URL, cell){
	
	// Crear nueva imagen
    const img = document.createElement("img");
    img.src = URL;
    img.className = "inserted-image";


    // Reemplazar la imagen existente
    cell.innerHTML = ""; 
    cell.appendChild(img);

    // EXTRA — guardar instrucción real
    cell.dataset.instruction = getInstructionNameFromUrl(URL);
}


function getInstructionSide(path) {
    if (!path || typeof path !== "string") return null;

    const lower = path.toLowerCase();

    if (lower.includes("/left/")) return "Left";
    if (lower.includes("/rigth/")) return "Right"; // se respeta tu carpeta "Rigth"

    return null; // No coincide
}


function getImageIndexByName(imageName) {
    if (!imageName) return -1;

    return FIXED_IMAGE_URLS.findIndex(path => {
        const lowerPath = path.toLowerCase();
        const lowerName = imageName.toLowerCase();
        return lowerPath.includes(`${lowerName}.png`);
    });
}

function updateRungNumbers() {
    const numbers = document.querySelectorAll(".RungNumber");
    numbers.forEach((el, index) => {
        el.dataset.num = index + 1;    // sigue guardando el dato
        el.textContent = index + 1;    // ahora sí lo mostramos
    });

    if (selectedRung) updateSelectedRungDisplay();
}


function selectRung(rungDiv) {
    // Si se cambia de Rung → limpiar cualquier celda seleccionada previa
    if (selectedRung && selectedRung !== rungDiv) {
        clearSelectedCell();
    }

    if (selectedRung) {
        selectedRung.classList.remove("selected");
    }

    selectedRung = rungDiv;
    selectedRung.classList.add("selected");

    updateSelectedRungDisplay();
}


function addRung() {
    const rungsContainer = document.getElementById("Rungs");

    const rung = document.createElement("div");
    rung.className = "Rung";

    const rungNumber = document.createElement("div");
    rungNumber.className = "RungNumber";

    const rungCode = document.createElement("div");
    rungCode.className = "RungCode";

    rung.appendChild(rungNumber);
    rung.appendChild(rungCode);
    rungsContainer.appendChild(rung);

    // Crear el grid inicial de 1 fila x 10 columnas
    createInitialGrid(rungCode, 1, InitialGridAmount);

	// === 🔥 Crear propiedades internas para este rung ===
    rung.properties = {
        LastInstructionLeft: -1,
        LastInstructionRight: InitialGridAmount,
		AmountCells: InitialGridAmount,
		AmountOfLines: 1
    };

    // Guardarlo en el arreglo global (opcional pero útil)
    rungProperties.push(rung.properties);


    // actualizar numeración
    updateRungNumbers();

    // asignar click del rung
    rung.addEventListener("click", () => selectRung(rung));
}


function createInitialGrid(target, rows, cols) {
    target.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
        createCell(target, "RungLines/WIRE.png");   // ← USAR createCell SIEMPRE
    }
}



function addColumn() {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const rungCode = selectedRung.querySelector(".RungCode");
    const cols = selectedRung.properties?.AmountCells ?? 10;   // columnas actuales
    const rows = selectedRung.properties?.AmountOfLines ?? 1;  // filas actuales

    // Agregar 1 celda por fila
    for (let row = 0; row < rows; row++) {
        createCell(rungCode, ""); // o null si quieres vacía
    }

    // Actualizar propiedad interna
    selectedRung.properties.AmountCells = cols + 1;

    // Ajustar ancho del Rung si quieres (opcional)
    // selectedRung.style.width = `${(cols + 1) * 120}px`; // 120 = ancho de celda
}


function addEmptyRowToSelectedRung() {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const rungCode = selectedRung.querySelector(".RungCode");
    const cols = selectedRung.properties?.AmountCells ?? 10;

    for (let i = 0; i < cols; i++) {
        createCell(rungCode, null); // fila vacía sin imagen
    }

    if (selectedRung.properties) {
        selectedRung.properties.AmountOfLines++;
    }

    // Ajustar altura del rung según filas
    const rowHeight = 120;
    selectedRung.style.height = `${selectedRung.properties.AmountOfLines * rowHeight}px`;
}


function highlightSelectedCell(cell, rungCode) {
    const all = rungCode.querySelectorAll(".grid-cell");
    all.forEach(c => c.classList.remove("selected-cell"));

    cell.classList.add("selected-cell");
}


function removeLastRowFromSelectedRung() {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const rungCode = selectedRung.querySelector(".RungCode");
    const properties = selectedRung.properties;

    if (!properties) return;

    // Solo eliminar si hay más de 1 fila
    if (properties.AmountOfLines <= 1) {
        alert("Cannot remove the last row.");
        return;
    }

    // Calcular cuántas columnas hay
    const computedStyle = window.getComputedStyle(rungCode);
    const cols = computedStyle.gridTemplateColumns.split(" ").length;

    // Eliminar las últimas 'cols' celdas
    for (let i = 0; i < cols; i++) {
        const lastCell = rungCode.lastElementChild;
        if (lastCell) rungCode.removeChild(lastCell);
    }

    // Actualizar propiedad interna
    properties.AmountOfLines--;

    // Ajustar altura del Rung y del RungNumber
    const rowHeight = 120; // altura de cada fila en px
    const totalHeight = properties.AmountOfLines * rowHeight;
    selectedRung.style.height = `${totalHeight}px`;
}

function clearSelectedCell() {
    // elimina cualquier highlight que exista en el DOM
    document.querySelectorAll('.selected-cell').forEach(c => c.classList.remove('selected-cell'));
    selectedCell = null;
}


function createCell(rungCode, imgSrc = null) {
	
	/**
	 * Crea una celda en un RungCode con su listener de selección
	 * @param {HTMLElement} rungCode - contenedor .RungCode
	 * @param {string|null} imgSrc - ruta de la imagen a insertar (null si vacía)
	 * @returns {HTMLElement} La celda creada
	 */
 
 
    const cell = document.createElement("div");
    cell.className = "grid-cell";
	
	// Guardar tipo de instrucción
    cell.dataset.instruction = imgSrc ? getInstructionNameFromUrl(imgSrc) : "EMPTY";

    // Listener de selección
    cell.addEventListener('click', () => {
        const rungDiv = rungCode.parentElement; // el .Rung
        selectRung(rungDiv);
        clearSelectedCell();
        selectedCell = cell;
        
        cell.classList.add('selected-cell');
    });

    // Imagen opcional
    if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        cell.appendChild(img);
    }

    rungCode.appendChild(cell);
    return cell;
}


function getInstructionNameFromUrl(url) {
    if (!url) return "EMPTY";
    const parts = url.split("/");
    const file = parts[parts.length - 1]; // "WIRE.png"
    return file.replace(".png","");       // → "WIRE"
}

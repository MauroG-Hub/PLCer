// ===============================
// CONFIGURACIÓN
// ===============================

// Cambia a false si NO quieres crear un rung al cargar la página
let autoAddFirstRung = true;
// Variable para guardar el Rung actualmente seleccionado
let selectedRung = null;
const rungProperties = [];
const InitialGridAmount = 15;



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
    const value = rung.properties?.[propertyName] ?? -1;

    const cellIndex =
        (Side === "Left")  ? value + 1 :
        (Side === "Right") ? value - 1 :
        null;

    if (cellIndex < 0 || cellIndex >= cells.length) {
        alert(`Invalid cell index. Must be between 0 and ${cells.length - 1}`);
        return;
    }

    // Celda a modificar
    const cell = cells[cellIndex];

    // Reemplazar imagen correctamente
    replaceGridImage(FIXED_IMAGE_URLS[Instruction], cell);

    // Actualizar propiedades
    rung.properties[propertyName] = cellIndex;
}



function replaceGridImage(URL, cell){
	
	// Crear nueva imagen
    const img = document.createElement("img");
    img.src = URL;
    img.className = "inserted-image";


    // Reemplazar la imagen existente
    cell.innerHTML = ""; 
    cell.appendChild(img);
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


// Función para actualizar TopBar
function updateSelectedRungDisplay() {
    const display = document.getElementById("SelectedRungDisplay");
    if (selectedRung) {
        const numberDiv = selectedRung.querySelector(".RungNumber");
        // fallback en caso de que dataset.num sea undefined
        const num = numberDiv?.dataset.num ?? "?";
        display.textContent = `Selected Rung: ${num}`;
    } else {
        display.textContent = "Selected Rung: None";
    }
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





// Modificar addRung para asignar click
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
        const cell = document.createElement("div");
        cell.className = "grid-cell";
		
		// ejemplo dentro del loop que crea 'cell'
		cell.addEventListener('click', (event) => {
			// NO usamos event.stopPropagation() -> así la selección del rung puede ocurrir por propagación o la forzamos explícitamente
			const rungCode = target; // en createInitialGrid el argumento 'target' es el .RungCode
			const rungDiv = rungCode.parentElement; // contenedor .Rung

			// Seleccionar el rung explícitamente (asegura que selectedRung se actualice)
			selectRung(rungDiv);

			// Limpiar cualquier selección previa (esto asegura que NUNCA queden 2 celdas resaltadas)
			clearSelectedCell();

			// Marcar la celda clickeada
			selectedCell = cell;
			cell.classList.add('selected-cell');
		});


        const img = document.createElement("img");
        img.src = "RungLines/WIRE.png";

        cell.appendChild(img);
        target.appendChild(cell);
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
        createCell(rungCode, "RungLines/WIRE.png"); // o null si quieres vacía
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
    cell.dataset.instruction = imgSrc ? getInstructionNameFromUrl(imgSrc) : "NONE";

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



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


function Addabranch(){

    const LastWireIndex = AddInstruction("TOCB");
    AddInstruction("TOCB");

    let rungCode = selectedRung.querySelector(".RungCode");

    if (!hasRowBelow(selectedRung, rungCode)) {
                addEmptyRowToSelectedRung();
    }

    rungCode = selectedRung.querySelector(".RungCode");
    let cells = rungCode.querySelectorAll(".grid-cell");

    const InsertedCell = cells[LastWireIndex];

    const NextCell = getNextCell(InsertedCell);
    const centerX = getCenterXByCell(InsertedCell, rungCode);
    const row = parseInt(InsertedCell.dataset.row) + 1;      // la fila donde quieres buscar
    const LowerBranchOpenCell = getCellByWidth(centerX, row, rungCode);
     if(LowerBranchOpenCell.dataset.instruction === "EMPTY"){
            let Wire = getWireImageIndexByName("OB");
            replaceGridImage(Wiring_URLs[Wire], LowerBranchOpenCell);
            const BranchNextCell = getNextCell(LowerBranchOpenCell);
            Wire = getWireImageIndexByName("CB");
            replaceGridImage(Wiring_URLs[Wire], BranchNextCell);
        }
        else{
            addEmptyRowToSelectedRung();
            const startRow = Number(InsertedCell.dataset.row) + 1;
            ShiftDownRows(startRow, selectedRung);
    
            const TOCBsIndex = getCellsByInstruction(rungCode, parseInt(cell.dataset.row), "TOCB", cells);
            for (let i = 0; i < TOCBsIndex.length; i++) {
                const cellIndex = TOCBsIndex[i];
                const cell = rungCode.children[cellIndex];

                const TOCBCellLocation = getCenterXByCell(cell, rungCode);
                const  CellBelowTOCB = getCellByWidth(TOCBCellLocation, row, rungCode);
                if(CellBelowTOCB.dataset.instruction === "EMPTY"){
                    const Wire = getWireImageIndexByName("VWIRE");
                    replaceGridImage(Wiring_URLs[Wire], CellBelowTOCB);
                    
                }
                
            }
        }
    
}

function getNextCell(cell) {
    const row = cell.parentNode;
    if (!row) return null;
    const nextColumn = parseInt(cell.dataset.col, 10) + 1;
    const rowIndex = cell.dataset.row;
    return row.querySelector(`.grid-cell[data-row='${rowIndex}'][data-col='${nextColumn}']`);
}

function AddInstruction(InstructionName, InsertIndex = -1) {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const Instruction = getImageIndexByName(InstructionName);
    let rungCode = selectedRung.querySelector(".RungCode");
    let cells = rungCode.querySelectorAll(".grid-cell");
    const rung = selectedRung;

    const Side = getInstructionSide(FIXED_IMAGE_URLS[Instruction]);
    const propertyName = 'LastInstruction' + Side;

    let selectedIndex = [...rungCode.children].indexOf(selectedCell);
    if (InsertIndex != -1){
        selectedIndex = InsertIndex;
    }
    
    let LastWireIndex = findLastWireIndex(cells, selectedIndex, Side);

    if (LastWireIndex < 0 || LastWireIndex >= cells.length) { LastWireIndex = 0;}

    // Celda a modificar
    let cell = cells[LastWireIndex];

    const CellInstruction = cells[LastWireIndex].dataset.instruction || "EMPTY";

    const NoShiftInstructions = new Set(["WIRE", "EMPTY"]);

    ShiftCtrl();

    // Reemplazar imagen correctamente
    replaceGridImage(FIXED_IMAGE_URLS[Instruction], cell);
    return LastWireIndex;

    // Actualizar propiedades
    rung.properties[propertyName] = LastWireIndex;

    function ShiftCtrl(force = false){
        if (!NoShiftInstructions.has(CellInstruction)) {
        const NextSpareWire = findSpareWire(cells, LastWireIndex);
     
        if (NextSpareWire === -1) {
            addColumn(); // agrega una celda por fila al selectedRung
            AddInstruction(InstructionName);
            return;
            }
      
            ShiftToRight(rungCode, cells, LastWireIndex, NextSpareWire);
            LastWireIndex++;
            rungCode = selectedRung.querySelector(".RungCode");
            cells = rungCode.querySelectorAll(".grid-cell");
            cell = cells[LastWireIndex];

        }
        
    }

};

function getCellsByInstruction(rungCode, rowNumber, instructionName, cells) {
    const result = [];

    for (let i = 0; i < cells.length; i++) {

        const cell = cells[i];

        // Verificar si pertenece a la fila indicada
        if (parseInt(cell.dataset.row) !== rowNumber) continue;

        // Verificar si coincide la instrucción
        if (cell.dataset.instruction === instructionName) {
            result.push(i);   // guardar index relativo a rungCode.children
        }
    }

    return result;
}

function ShiftDownRows(startRow, selectedRung) {
    const rungCode = selectedRung.querySelector(".RungCode");
    const cells = [...rungCode.querySelectorAll(".grid-cell")];

    const totalRows = selectedRung.properties.AmountOfLines;
    // 1. Mover filas comenzando desde la última hacia startRow
    for (let row = totalRows; row >= startRow; row--) {
        const rowCells = cells.filter(c => parseInt(c.dataset.row) === row);
        
        for (const cell of rowCells) {
            cell.dataset.row = row + 1;
        }
    }

    const rowCells = cells.filter(c => parseInt(c.dataset.row) === (totalRows+1));
    for (const cell of rowCells) {
        cell.dataset.row = startRow;
    }


    // 3. Reordenar DOM según row y col
    reorderGridDOM(rungCode);
}

function reorderGridDOM(rungCode) {
    const cells = [...rungCode.querySelectorAll(".grid-cell")];

    cells.sort((a, b) => {
        const rowA = Number(a.dataset.row);
        const rowB = Number(b.dataset.row);
        const colA = Number(a.dataset.col);
        const colB = Number(b.dataset.col);

        return rowA === rowB ? colA - colB : rowA - rowB;
    });

    cells.forEach(c => rungCode.appendChild(c));
}

function getCellByWidth(targetX, row, rungCode) {
    if (!rungCode) return null;

    // Obtener celdas de esa fila
    const cells = [...rungCode.querySelectorAll('.grid-cell')]
        .filter(c => Number(c.dataset.row) === Number(row));

    if (cells.length === 0) return null;

    let acumulado = 0;

    for (const cell of cells) {
        const width = cell.offsetWidth;

        acumulado += width;

        if (targetX <= acumulado) {
            return cell;
        }
    }

    // Si se pasa del total, devolvemos la última celda
    return cells[cells.length - 1];
}

function getCenterXByCell(targetCell, rungCode) {
    if (!targetCell || !rungCode) return 0;

    const targetRow = parseInt(targetCell.dataset.row, 10);

    // Todas las celdas de esa fila
    const rowCells = [...rungCode.querySelectorAll(`.grid-cell[data-row='${targetRow}']`)]
        .sort((a, b) => parseInt(a.dataset.col, 10) - parseInt(b.dataset.col, 10)); // por si el DOM cambia de orden

    const targetCol = parseInt(targetCell.dataset.col, 10);
    let sum = 0;

    // Sumar los anchos de todas las celdas previas en la fila
    for (let cell of rowCells) {
        const col = parseInt(cell.dataset.col, 10);
        if (col < targetCol) {
            sum += cell.offsetWidth;
        }
    }

    // Mitad del ancho de la celda objetivo
    const centerOffset = targetCell.offsetWidth / 2;

    return sum + centerOffset;
}

function hasRowBelow(selectedRung, rungCode) {
    if (!selectedRung) return false;

    const cells = [...rungCode.children];

    const index = cells.indexOf(selectedCell);
    if (index === -1) return false;

    const totalCols = selectedRung.properties?.AmountCells ?? 10;
    const totalRows = selectedRung.properties?.AmountOfLines ?? 1;
    const currentRow = Math.floor(index / totalCols);

    return currentRow < totalRows - 1;
}

function findLastWireIndex(cells, selectedIndex, side) {

    // Determinar dirección según side
    const step = side === "Left" ? -1 : side === "Right" ? 1 : 0;
    const Row = cells[selectedIndex].dataset.row;

    if (step === 0) {
        console.warn("Side inválido:", side);
        return selectedIndex;
    }

    let index = selectedIndex + step;

    // Si la celda vecina no tiene wire → regresar la celda seleccionada
    if (!cells[index] || (cells[index].dataset.instruction !== "WIRE" && cells[index].dataset.instruction !== "EMPTY")) {
        return selectedIndex;
    }

    // Si sí tiene wire → avanzar mientras siga habiendo wire en ese lado
    while (cells[index] && cells[index].dataset.instruction === "WIRE" && cells[index].dataset.row ===  Row) {
        index += step;
    }

    // Nos pasamos una posición, regresar una atrás
    return index - step;
}

function findSpareWire(cells, startIndex) {
    let NextWireIndex = -1;
    for (let i = startIndex + 1; i < cells.length; i++) {
        if ((cells[i].dataset.instruction === "WIRE")||((cells[i].dataset.instruction === "EMPTY"))) {
            return i;
        }
    }
    return NextWireIndex;
}

function ShiftToRight(rungCode, cellsArray, lastWireIndex, NextSpareWire) {
    if (lastWireIndex < 0 || lastWireIndex >= cellsArray.length) return;

    const Row = parseInt(cellsArray[lastWireIndex].dataset.row);
    const LastCol = getLastColumnOfRow(cellsArray[lastWireIndex]);
    const offset = (Row - 1)*LastCol;

    const EndIndex = NextSpareWire !== -1 ? NextSpareWire : (LastCol*Row)-1;

    // 1️⃣ Actualizar dataset.col de las celdas para desplazarlas una posición a la derecha
    const cell = cellsArray[EndIndex];
    cell.dataset.col = lastWireIndex + 2  - offset;

    for (let i = EndIndex - 1; i > lastWireIndex; i--) {
        const cell = cellsArray[i];
        if (!cell) continue;

        cell.dataset.col = i + 2 - offset;
    }
  

    // 3️⃣ Reordenar el DOM según row y col
    reorderGridDOM(rungCode);
    
}

function getLastColumnOfRow(cell) {
    if (!cell) return null;

    const row = cell.parentNode;
    if (!row) return null;

    let lastCol = -1;
    for (const c of row.children) {
        const col = parseInt(c.dataset.col, 10);
        if (!isNaN(col) && col > lastCol) {
            lastCol = col;
        }
    }

    return lastCol; // número de columna
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

function getWireImageIndexByName(imageName) {
    if (!imageName) return -1;

    return Wiring_URLs.findIndex(path => {
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

    let row = 1;
    let col = 1;

    for (let i = 0; i < rows * cols; i++) {
        const cell = createCell(target, "RungLines/WIRE.png", row, col);

        // Asignar dataset
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Avanzar a la siguiente celda
        col++;
        if (col > cols) {
            col = 1;
            row++;
        }
    }
}

function addColumn(steps = 1) {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const rungCode = selectedRung.querySelector(".RungCode");
    let cols = selectedRung.properties?.AmountCells ?? 10;   // columnas actuales
    const rows = selectedRung.properties?.AmountOfLines ?? 1;  // filas actuales

    for (let step = 0; step < steps; step++) {
        const newCol = cols + 1;

        // Agregar una celda por fila
        for (let row = 0; row < rows; row++) {
            createCell(rungCode, null, row + 1, newCol); // null = celda vacía
        }

        cols++; // actualizar contador de columnas
    }

    // Actualizar propiedad interna
    selectedRung.properties.AmountCells = cols;
    
    // Actualizar estilo CSS del grid
    rungCode.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function addEmptyRowToSelectedRung() {
    if (!selectedRung) {
        alert("Select a rung first.");
        return;
    }

    const rungCode = selectedRung.querySelector(".RungCode");
    const cols = selectedRung.properties?.AmountCells ?? 10;

    // Nueva fila = total filas + 1
    const newRow = (selectedRung.properties?.AmountOfLines ?? 1) + 1;

    for (let i = 0; i < cols; i++) {
        createCell(rungCode, null, newRow, i+1); // fila vacía sin imagen
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

function createCell(rungCode, imgSrc = null, row, col) {
	
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

    // Guardar la fila y columna en dataset
    cell.dataset.row = row;
    cell.dataset.col = col;

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

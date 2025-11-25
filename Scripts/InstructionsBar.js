

document.getElementById("NOC").addEventListener("click", () => {
    AddInstruction("NOC");
});

document.getElementById("NCC").addEventListener("click", () => {
    AddInstruction("NCC");
});

document.getElementById("COIL").addEventListener("click", () => {
    AddInstruction("COIL");
});

document.getElementById("OB").addEventListener("click", () => {
    replaceGridImage("OB");
});

document.getElementById("CB").addEventListener("click", () => {
    replaceGridImage("CB");
});

document.getElementById("Row").addEventListener("click", () => {
    addEmptyRowToSelectedRung();
});

document.getElementById("Col").addEventListener("click", () => {
    addColumn();
});


const FIXED_IMAGE_URLS = [
    "Instructions/Left/NOC.png",
    "Instructions/Left/NCC.png",
    "Instructions/Rigth/COIL.png"
];

const Wiring_URLs = [
	"RungLines/WIRE.png",
    "RungLines/OB.png",
    "RungLines/CB.png",
	"RungLines/TOB.png",
	"RungLines/TCB.png"
];
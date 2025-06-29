#!/usr/bin/env python3
"""
Este script procesa un archivo .obj, extrayendo los vértices y caras, y los organiza
por grupos o colecciones. Los resultados se guardan en un archivo de texto estructurado.
"""

import sys
import re
from pathlib import Path
from tkinter import Tk, filedialog, messagebox

# Funciones de procesamiento de archivos .obj


def analizarOBJ(path: Path):
    """Devuelve (vertices, faces, grupoNombres) a partir de un .obj."""
    vertices, faces = [], []
    grupoNombres = []
    grupoActual = "Objeto_principal"

    with path.open("r", encoding="utf-8", errors="ignore") as lineas:
        for linea in lineas:  # Leer línea por línea
            linea = linea.strip()
            if linea.startswith("v "):  # Vértice
                _, x, y, z, *rest = linea.split()
                vertices.append((float(x), float(y), float(z)))
                grupoNombres.append(grupoActual)
            elif linea.startswith("f "):  # Cara
                indices = [int(chunk.split('/')[0])
                           for chunk in linea.split()[1:]]
                faces.append(indices)
            elif linea.startswith("g "):  # Grupo/nombre de colección
                grupoActual = linea[2:].strip(
                ) or f"Grupo_{len(grupoNombres)+1}"
            elif linea.startswith("o "):  # Nombre de objeto
                grupoActual = linea[2:].strip(
                ) or f"Objeto_{len(grupoNombres)+1}"

    return vertices, faces, grupoNombres


def group_vertices(vertices, grupoNombres):
    """Agrupa vértices por sus nombres de colección."""
    agrupacion = {}
    for idx, (vertex, grupo) in enumerate(zip(vertices, grupoNombres), start=1):
        if grupo not in agrupacion:
            agrupacion[grupo] = []
        agrupacion[grupo].append((idx, vertex))
    return agrupacion


def formatoSalida(grupoVertices, faces) -> str:
    """Formatea la salida con nombres de colección."""
    lineasSalida = ["# Archivo generado automáticamente\n"]

    # Vértices agrupados por nombre de colección
    for nombreGrupo, vertices in grupoVertices.items():
        indiceInicio = vertices[0][0]
        indiceFin = vertices[-1][0]

        lineasSalida.append(
            f"\n# Colección: {nombreGrupo} (Vértices {indiceInicio}-{indiceFin})")
        for indiceGlobal, (x, y, z) in vertices:
            lineasSalida.append(f"{indiceGlobal} {x:g} {y:g} {z:g}")
        lineasSalida.append(f"# Fin de {nombreGrupo}\n")

    # Caras
    lineasSalida.append("\nFaces:")
    for face in faces:
        lineasSalida.append(f"{' '.join(map(str, face))}.")
    lineasSalida.append("# Fin de caras")

    return "\n".join(lineasSalida)


def seleecionarArchivos():
    """Abre una ventana para seleccionar el archivo .obj."""
    root = Tk()
    root.withdraw()
    rutaArchivo = filedialog.askopenfilename(
        title="Seleccionar archivo .obj",
        filetypes=[("OBJ files", "*.obj"), ("All files", "*.*")]
    )
    return Path(rutaArchivo) if rutaArchivo else None


def obtenerRutaUnica(obj_path: Path, directorioSalida: Path) -> Path:
    """Genera una ruta de salida única."""
    nombreObjeto = obj_path.stem
    contador = 0
    while True:
        nombreSalida = f"{nombreObjeto}_estructurado.txt" if contador == 0 else f"{nombreObjeto}_estructurado_{contador}.txt"
        rutaSalida = directorioSalida / nombreSalida
        if not rutaSalida.exists():
            return rutaSalida
        contador += 1


def main():
    # 1. Seleccionar archivo .obj
    obj_path = seleecionarArchivos()
    if not obj_path:
        messagebox.showerror("Error", "No se seleccionó ningún archivo.")
        return

    # 2. Procesar el archivo
    try:
        vertices, faces, grupoNombres = analizarOBJ(obj_path)
        grupoVertices = group_vertices(vertices, grupoNombres)
        output_text = formatoSalida(grupoVertices, faces)
    except Exception as e:
        messagebox.showerror("Error", f"Falló al procesar el archivo:\n{e}")
        return

    # 3. Guardar en la ruta especificada
    directorioSalida = Path(r"C:\Users\Vladimir\Documents\blender\salida")
    directorioSalida.mkdir(parents=True, exist_ok=True)
    rutaSalida = obtenerRutaUnica(obj_path, directorioSalida)

    try:
        rutaSalida.write_text(output_text, encoding="utf-8")
        messagebox.showinfo("Éxito", f"Resultado guardado en:\n{rutaSalida}")
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo guardar el archivo:\n{e}")


if __name__ == "__main__":
    main()

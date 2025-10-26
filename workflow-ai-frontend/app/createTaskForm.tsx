// Esto le dice a Next.js: "Este es un Componente de Cliente".
// Ahora podemos usar estado, efectos y eventos (interactividad).
"use client";

// 2. Importamos los 'hooks' de React que necesitamos
import { useState } from "react";
import { useRouter } from "next/navigation"; // refresca la página

export function CreateTaskForm() {
    // 3. 'useState': Este es el 'hook' de estado de React.
    // Es el equivalente a tener una variable en tu componente
    // de Angular que se actualiza con '[(ngModel)]' o un 'FormControl'.
    //
    // const [variable, funcionParaActualizarla] = useState(valorInicial);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // 4. 'useRouter': Nos da acceso al router de Next.js
    const router = useRouter();

    // 5. 'handleSubmit': La función que se ejecuta al enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        // Previene que el formulario recargue la página entera (como en JS puro)
        e.preventDefault();

        // Validación simple
        if (!title) {
            alert("El título es obligatorio");
            return;
        }

        // 6. ¡El 'fetch' al backend! (Igual que en Angular)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Convertimos el estado a JSON
                body: JSON.stringify({
                    title,
                    description,
                }),
            });

            if (!res.ok) {
                throw new Error('Error al crear la tarea');
            }

            // 7. ¡LA MAGIA DE NEXT.JS!
            // Limpiamos el formulario
            setTitle("");
            setDescription("");

            // 'router.refresh()' le dice a Next.js que "refresque"
            // la página. Esto hará que nuestro 'page.tsx' (Server Component)
            // vuelva a pedir los datos (GET /tasks/) y se actualice
            // con la nueva tarea. ¡Es súper eficiente!
            router.refresh();

        } catch (error) {
            console.error(error);
            alert("Hubo un error al crear la tarea.");
        }
    };

    // 8. El JSX (HTML) del formulario
    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Crear Nueva Tarea</h2>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Título"
                    value={title} // 'value' bindea el estado al input (One-way)
                    onChange={(e) => setTitle(e.target.value)} // 'onChange' actualiza el estado (Two-way)
                    className="p-2 border rounded"
                />
                <textarea
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 border rounded"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Crear Tarea
                </button>
            </div>
        </form>
    );
}
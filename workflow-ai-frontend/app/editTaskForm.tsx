"use client";

import { Task } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

//Props: Recibirá la tarea que se va a editar
interface EditTaskFormProps {
    task: Task;
}

export function EditTaskForm({ task }: EditTaskFormProps) {
    const router = useRouter();

    //¡Clave! Inicializa el estado 'useState'
    //    con los valores de la tarea que recibe por props.
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || ""); // ("" si es null)

    //Lógica para enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            //¡Petición PATCH!
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                }),
            });

            if (!res.ok) {
                throw new Error('Error al actualizar la tarea');
            }

            //Si todo sale ok, redirige al usuario
            //    a la página de inicio.
            router.push('/'); // Redirige a la home
            router.refresh(); // Refresca la data de la home

        } catch (error) {
            console.error(error);
            alert("Hubo un error al actualizar la tarea.");
        }
    };

    return (
        //El JSX del formulario
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg">
            <div className="flex flex-col gap-3">
                <label className="font-semibold">Título</label>
                <input
                    type="text"
                    value={title} // Bindeado al estado
                    onChange={(e) => setTitle(e.target.value)} // Actualiza el estado
                    className="p-2 border rounded"
                />

                <label className="font-semibold">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 border rounded"
                    rows={4}
                />

                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Guardar Cambios
                </button>
            </div>
        </form>
    );
}
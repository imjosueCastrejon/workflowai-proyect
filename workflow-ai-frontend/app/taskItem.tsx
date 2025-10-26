// 1. ¡Componente de Cliente!
"use client";
import Link from "next/link";


import { Task } from "@/types"; // Nuestra interfaz compartida
import { useRouter } from "next/navigation";

// 3. se definen las 'props' que recibirá el componente
// (En Angular, esto sería un @Input())
interface TaskItemProps {
    task: Task;
}

// 4. El componente. Recibe 'task' como prop.
export function TaskItem({ task }: TaskItemProps) {
    const router = useRouter();

    // 5. Lógica para manejar el borrado
    const handleDelete = async () => {
        // Pide confirmacion
        if (!confirm(`¿Seguro que quieres borrar la tarea: "${task.title}"?`)) {
            return;
        }

        try {
            // 6. endpoint de DELETE
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Error al borrar la tarea');
            }

            // 7. Si todo sale bien, refresca la lista
            router.refresh();

        } catch (error) {
            console.error(error);
            alert("Hubo un error al borrar la tarea.");
        }
    };

    const handleAnalyze = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}/analyze`, {
                method: 'POST',
            });

            if (!res.ok) {
                // Si la API da un 400 (ej. "sin descripción"), se muestra
                if (res.status === 400) {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.detail}`)
                } else {
                    throw new Error('Error to analyze task')
                }
            } else {
                //si todo sale bien se hace un refresh
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("Error while analyze task")
        }
    };

    // 8. El JSX
    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center">
            <div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
                <p className="text-gray-700">{task.description}</p>

                {/* muestra el resumen de la ia si existe */}
                {task.ai_summary && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-semibold text-blue-800">Resumen de IA:</p>
                        <p className="text-sm text-blue-700 italic">{task.ai_summary}</p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
                <button
                    onClick={handleAnalyze}
                    // se deshabilita el botón si no hay descripción o si ya fue analizada
                    disabled={!task.description || !!task.ai_summary}
                    className={`px-3 py-1 text-white rounded text-sm ${!task.description || !!task.ai_summary
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {task.ai_summary ? 'Analizada' : 'Analizar IA'}
                </button>

                <Link
                    href={`/tasks/${task.id}/edit`}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                    Editar
                </Link>
                <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                    Borrar
                </button>
            </div>
        </div>
    );
}
/** page server component para editar tareas */

import { Task } from "@/types";
import Link from "next/link";
import { EditTaskForm } from "../../../editTaskForm";

// Función para OBTENER la tarea individual desde la API
async function getTask(id: string): Promise<Task | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/tasks/${id}`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error('Falló al obtener la tarea');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- El Componente de la Página de Edición ---

// 1. Next.js pasará los 'params' que contienen los
//    segmentos dinámicos de la URL (en este caso, 'id').

export default async function EditTaskPage({ params }: { params: { id: string }}) {
  const { id } = await params;

  // 2. Obtiene la tarea usando el 'id' de la URL
  const task = await getTask(id);

  // 3. Manejo de Tarea No Encontrada
  if (!task) {
    return (
      <main className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Tarea no encontrada</h1>
        <p className="mb-4">No pudimos encontrar la tarea que buscas.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </main>
    );
  }

  // 4. Si enceuntra la tarea, muestra el formulario
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Editar Tarea: {task.title}
      </h1>

      {/* Aquí es donde pondremos nuestro formulario de edición */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <EditTaskForm task={ task } />
      </div>

      <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
        Cancelar y volver
      </Link>
    </main>
  );
}
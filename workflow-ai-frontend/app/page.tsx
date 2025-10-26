// Este es un "Server Component" en Next.js.
// Se ejecuta en el servidor, NO en el navegador del usuario.
// Por eso podemos hacer 'async' y 'await' directamente.


import { Task } from "@/types";
import { CreateTaskForm } from "./createTaskForm";
import { TaskItem } from "./taskItem";

// 2. Función para obtener las tareas
async function getTasks(): Promise<Task[]> {
  try {
    // con fetch para HACER PETICIONES
    // 'cache: "no-store"' asegura que siempre pida datos frescos
    // (útil para desarrollo, como un --reload)
    const res = await fetch(`${process.env.API_URL}/tasks/`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('failed to get tasks');
    }

    return res.json();

  } catch (error) {
    console.error(error);
    return []; // Regresa un array vacío si hay un error
  }
}


// 3. El componente de la Página (¡ahora es 'async'!)
export default async function Home() {
  // 4. Llamamos a la función y esperamos los datos
  const tasks = await getTasks();

  // 5. Renderizamos el JSX (es como el HTML de Angular)
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Mis Tareas</h1>

      <CreateTaskForm />

      <div className="flex flex-col gap-4">
        {/* .map() para iterar (es el 'ngFor' de React)
          'key={task.id}' es obligatorio para que React
          identifique cada elemento de la lista.
        */}
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {/* Mensaje si no hay tareas */}
        {tasks.length === 0 && (
          <p className="text-gray-500">No hay tareas. ¡Intenta crear una desde /docs!</p>
        )}
      </div>
    </main>
  );
}